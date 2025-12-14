import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'smartop' },
    update: {},
    create: {
      name: 'Smartop A.Ş.',
      slug: 'smartop',
      phone: '+90 212 555 4321',
      email: 'info@smartop.com.tr',
      address: 'Eskişehir, Türkiye',
      subscriptionTier: 'professional',
      subscriptionStatus: 'active',
    },
  });

  console.log('Created organization:', organization.name);

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId: organization.id,
        email: 'admin@smartop.com.tr',
      }
    },
    update: {},
    create: {
      organizationId: organization.id,
      email: 'admin@smartop.com.tr',
      passwordHash: adminPassword,
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      role: 'admin',
      phone: '+90 532 555 1234',
      jobTitle: 'Genel Müdür',
    },
  });

  console.log('Created admin:', admin.email);

  // Create manager user
  const managerPassword = await bcrypt.hash('Manager123!', 12);
  const manager = await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId: organization.id,
        email: 'manager@smartop.com.tr',
      }
    },
    update: {},
    create: {
      organizationId: organization.id,
      email: 'manager@smartop.com.tr',
      passwordHash: managerPassword,
      firstName: 'Mehmet',
      lastName: 'Kaya',
      role: 'manager',
      phone: '+90 533 555 2345',
      jobTitle: 'Şantiye Şefi',
    },
  });

  console.log('Created manager:', manager.email);

  // Create operator users
  const operatorPassword = await bcrypt.hash('Operator123!', 12);
  const operators = await Promise.all([
    prisma.user.upsert({
      where: {
        organizationId_email: {
          organizationId: organization.id,
          email: 'operator1@smartop.com.tr',
        }
      },
      update: {},
      create: {
        organizationId: organization.id,
        email: 'operator1@smartop.com.tr',
        passwordHash: operatorPassword,
        firstName: 'Ali',
        lastName: 'Demir',
        role: 'operator',
        phone: '+90 534 555 3456',
        jobTitle: 'Ekskavatör Operatörü',
        licenses: ['A2', 'B'],
        specialties: ['excavator', 'loader'],
      },
    }),
    prisma.user.upsert({
      where: {
        organizationId_email: {
          organizationId: organization.id,
          email: 'operator2@smartop.com.tr',
        }
      },
      update: {},
      create: {
        organizationId: organization.id,
        email: 'operator2@smartop.com.tr',
        passwordHash: operatorPassword,
        firstName: 'Veli',
        lastName: 'Yıldız',
        role: 'operator',
        phone: '+90 535 555 4567',
        jobTitle: 'Vinç Operatörü',
        licenses: ['A2', 'C'],
        specialties: ['crane'],
      },
    }),
  ]);

  console.log('Created operators:', operators.length);

  // No demo machines, jobs, checklists - users will add their own data

  console.log('Seeding completed!');
  console.log('\nDemo Credentials:');
  console.log('Admin: admin@smartop.com.tr / Admin123!');
  console.log('Manager: manager@smartop.com.tr / Manager123!');
  console.log('Operator: operator1@smartop.com.tr / Operator123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
