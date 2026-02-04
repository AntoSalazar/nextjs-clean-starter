import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD ?? 'admin123';
  const fullName = process.env.ADMIN_NAME ?? 'Super Admin';

  console.log(`Creating admin user: ${email}`);

  // Check if admin already exists
  const existingAdmin = await prisma.users.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log('Admin user already exists. Skipping creation.');
    return;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create admin user with all permissions
  const admin = await prisma.users.create({
    data: {
      email,
      password_hash: passwordHash,
      full_name: fullName,
      role: 'admin',
      permissions: ['admin:*', 'users:read', 'users:write', 'api_keys:read', 'api_keys:write'],
      is_active: true,
    },
  });

  console.log(`Admin user created successfully:`);
  console.log(`  ID: ${admin.id}`);
  console.log(`  Email: ${admin.email}`);
  console.log(`  Role: ${admin.role}`);
}

main()
  .catch((error) => {
    console.error('Failed to create admin user:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
