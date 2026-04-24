import bcryptjs from 'bcryptjs';
import { createAdminUser } from './db';

async function seedAdmin() {
  try {
    // Create default admin user
    const hashedPassword = await bcryptjs.hash('admin123', 10);
    
    await createAdminUser({
      username: 'admin',
      passwordHash: hashedPassword,
      email: 'admin@ooredoo.com',
    });

    console.log('Admin user created successfully');
    console.log('Username: admin');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
}

seedAdmin();
