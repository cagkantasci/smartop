import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Cleaning database for production-ready state...');

  // Delete all data in correct order (respecting foreign keys)
  console.log('Deleting password reset tokens...');
  await prisma.passwordResetToken.deleteMany();

  console.log('Deleting refresh tokens...');
  await prisma.refreshToken.deleteMany();

  console.log('Deleting device tokens...');
  await prisma.deviceToken.deleteMany();

  console.log('Deleting audit logs...');
  await prisma.auditLog.deleteMany();

  console.log('Deleting notifications...');
  await prisma.notification.deleteMany();

  console.log('Deleting invoices...');
  await prisma.invoice.deleteMany();

  console.log('Deleting service records...');
  await prisma.serviceRecord.deleteMany();

  console.log('Deleting job assignments...');
  await prisma.jobAssignment.deleteMany();

  console.log('Deleting jobs...');
  await prisma.job.deleteMany();

  console.log('Deleting checklist submissions...');
  await prisma.checklistSubmission.deleteMany();

  console.log('Deleting checklist templates...');
  await prisma.checklistTemplate.deleteMany();

  console.log('Deleting machines...');
  await prisma.machine.deleteMany();

  console.log('Deleting users (except admin)...');
  // Keep admin users but remove operators that are not needed
  await prisma.user.deleteMany({
    where: {
      role: { not: 'admin' }
    }
  });

  console.log('');
  console.log('✅ Database cleaned successfully!');
  console.log('');
  console.log('ℹ️  To seed with initial data, run: npx prisma db seed');
}

main()
  .catch((e) => {
    console.error('❌ Error cleaning database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
