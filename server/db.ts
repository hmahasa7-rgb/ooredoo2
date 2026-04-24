import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, paymentTransactions, InsertPaymentTransaction, adminUsers, InsertAdminUser } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Payment transaction functions
 */

export async function createPaymentTransaction(transaction: InsertPaymentTransaction) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create transaction: database not available");
    return null;
  }

  try {
    const result = await db.insert(paymentTransactions).values(transaction);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create transaction:", error);
    throw error;
  }
}

export async function getPaymentTransactions() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get transactions: database not available");
    return [];
  }

  try {
    const result = await db.select().from(paymentTransactions).orderBy(paymentTransactions.createdAt);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get transactions:", error);
    return [];
  }
}

export async function deletePaymentTransaction(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete transaction: database not available");
    return false;
  }

  try {
    await db.delete(paymentTransactions).where(eq(paymentTransactions.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete transaction:", error);
    return false;
  }
}

/**
 * Admin user functions
 */

export async function createAdminUser(admin: InsertAdminUser) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create admin: database not available");
    return null;
  }

  try {
    const result = await db.insert(adminUsers).values(admin);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create admin:", error);
    throw error;
  }
}

export async function getAdminByUsername(username: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get admin: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get admin:", error);
    return undefined;
  }
}
