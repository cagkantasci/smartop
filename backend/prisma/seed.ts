import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create demo organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'demo-insaat' },
    update: {},
    create: {
      name: 'Demo İnşaat A.Ş.',
      slug: 'demo-insaat',
      phone: '+90 212 555 1234',
      email: 'info@demo-insaat.com',
      address: 'Levent, İstanbul, Türkiye',
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
        email: 'admin@demo-insaat.com',
      }
    },
    update: {},
    create: {
      organizationId: organization.id,
      email: 'admin@demo-insaat.com',
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
        email: 'manager@demo-insaat.com',
      }
    },
    update: {},
    create: {
      organizationId: organization.id,
      email: 'manager@demo-insaat.com',
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
          email: 'operator1@demo-insaat.com',
        }
      },
      update: {},
      create: {
        organizationId: organization.id,
        email: 'operator1@demo-insaat.com',
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
          email: 'operator2@demo-insaat.com',
        }
      },
      update: {},
      create: {
        organizationId: organization.id,
        email: 'operator2@demo-insaat.com',
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

  // Create checklist template
  const template = await prisma.checklistTemplate.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      organizationId: organization.id,
      name: 'Günlük Makine Kontrol Listesi',
      description: 'Tüm iş makineleri için günlük kontrol listesi',
      machineTypes: ['excavator', 'dozer', 'loader', 'crane'],
      items: [
        { id: '1', label: 'Motor yağı seviyesi kontrol edildi', type: 'boolean', required: true },
        { id: '2', label: 'Hidrolik yağ seviyesi kontrol edildi', type: 'boolean', required: true },
        { id: '3', label: 'Soğutma suyu seviyesi kontrol edildi', type: 'boolean', required: true },
        { id: '4', label: 'Lastik/paletler kontrol edildi', type: 'boolean', required: true },
        { id: '5', label: 'Fren sistemi çalışıyor', type: 'boolean', required: true },
        { id: '6', label: 'Aydınlatma sistemleri çalışıyor', type: 'boolean', required: true },
        { id: '7', label: 'Güvenlik kemeri mevcut', type: 'boolean', required: true },
        { id: '8', label: 'Yangın söndürücü mevcut', type: 'boolean', required: true },
        { id: '9', label: 'Motor çalışma saati', type: 'number', required: true },
        { id: '10', label: 'Ek notlar', type: 'text', required: false },
      ],
      createdById: manager.id,
    },
  });

  console.log('Created template:', template.name);

  // Create machines
  const machines = await Promise.all([
    prisma.machine.upsert({
      where: { id: '00000000-0000-0000-0000-000000000101' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000101',
        organizationId: organization.id,
        name: 'Ekskavatör CAT 320',
        brand: 'Caterpillar',
        model: '320 GC',
        year: 2022,
        machineType: 'excavator',
        serialNumber: 'CAT320-2022-001',
        licensePlate: '34 ABC 123',
        status: 'active',
        engineHours: 1250,
        fuelType: 'Dizel',
        fuelCapacity: 400,
        checklistTemplateId: template.id,
        assignedOperatorId: operators[0].id,
        locationLat: 41.0082,
        locationLng: 28.9784,
        locationAddress: 'Levent Şantiyesi, İstanbul',
      },
    }),
    prisma.machine.upsert({
      where: { id: '00000000-0000-0000-0000-000000000102' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000102',
        organizationId: organization.id,
        name: 'Mobil Vinç Liebherr LTM',
        brand: 'Liebherr',
        model: 'LTM 1100-5.2',
        year: 2021,
        machineType: 'crane',
        serialNumber: 'LTM1100-2021-001',
        licensePlate: '34 DEF 456',
        status: 'idle',
        engineHours: 890,
        fuelType: 'Dizel',
        fuelCapacity: 500,
        checklistTemplateId: template.id,
        assignedOperatorId: operators[1].id,
        locationLat: 41.0122,
        locationLng: 28.9761,
        locationAddress: 'Maslak Şantiyesi, İstanbul',
      },
    }),
    prisma.machine.upsert({
      where: { id: '00000000-0000-0000-0000-000000000103' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000103',
        organizationId: organization.id,
        name: 'Yükleyici Komatsu WA380',
        brand: 'Komatsu',
        model: 'WA380-8',
        year: 2023,
        machineType: 'loader',
        serialNumber: 'KOM380-2023-001',
        licensePlate: '34 GHI 789',
        status: 'maintenance',
        engineHours: 450,
        fuelType: 'Dizel',
        fuelCapacity: 300,
        checklistTemplateId: template.id,
        locationLat: 41.0055,
        locationLng: 28.9690,
        locationAddress: 'Bakım Merkezi, İstanbul',
      },
    }),
  ]);

  console.log('Created machines:', machines.length);

  // Create a job
  const job = await prisma.job.upsert({
    where: { id: '00000000-0000-0000-0000-000000000201' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000201',
      organizationId: organization.id,
      title: 'Temel Kazı Çalışması',
      description: 'A Blok temel kazı işleri',
      locationName: 'Levent Projesi - A Blok',
      locationLat: 41.0082,
      locationLng: 28.9784,
      locationAddress: 'Levent, Beşiktaş, İstanbul',
      status: 'in_progress',
      priority: 'high',
      progress: 35,
      scheduledStart: new Date('2024-01-15'),
      scheduledEnd: new Date('2024-02-15'),
      estimatedHours: 200,
      createdById: manager.id,
    },
  });

  console.log('Created job:', job.title);

  // Create job assignments
  await prisma.jobAssignment.createMany({
    data: [
      { jobId: job.id, machineId: machines[0].id, operatorId: operators[0].id },
    ],
    skipDuplicates: true,
  });

  console.log('Created job assignments');

  // Create a sample checklist submission
  const submission = await prisma.checklistSubmission.upsert({
    where: { id: '00000000-0000-0000-0000-000000000301' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000301',
      organizationId: organization.id,
      machineId: machines[0].id,
      templateId: template.id,
      operatorId: operators[0].id,
      status: 'pending',
      entries: [
        { itemId: '1', label: 'Motor yağı seviyesi kontrol edildi', isOk: true },
        { itemId: '2', label: 'Hidrolik yağ seviyesi kontrol edildi', isOk: true },
        { itemId: '3', label: 'Soğutma suyu seviyesi kontrol edildi', isOk: true },
        { itemId: '4', label: 'Lastik/paletler kontrol edildi', isOk: true },
        { itemId: '5', label: 'Fren sistemi çalışıyor', isOk: true },
        { itemId: '6', label: 'Aydınlatma sistemleri çalışıyor', isOk: false, value: 'Sol far çalışmıyor' },
        { itemId: '7', label: 'Güvenlik kemeri mevcut', isOk: true },
        { itemId: '8', label: 'Yangın söndürücü mevcut', isOk: true },
        { itemId: '9', label: 'Motor çalışma saati', isOk: true, value: '1250' },
        { itemId: '10', label: 'Ek notlar', isOk: true, value: 'Sol far değiştirilmeli' },
      ],
      issuesCount: 1,
      notes: 'Sol far arızalı, değişim gerekli',
      locationLat: 41.0082,
      locationLng: 28.9784,
    },
  });

  console.log('Created checklist submission');

  console.log('Seeding completed!');
  console.log('\nDemo Credentials:');
  console.log('Admin: admin@demo-insaat.com / Admin123!');
  console.log('Manager: manager@demo-insaat.com / Manager123!');
  console.log('Operator: operator1@demo-insaat.com / Operator123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
