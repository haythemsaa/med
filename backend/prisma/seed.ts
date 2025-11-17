import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/encryption';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Super Admin User
  const superAdminPassword = await hashPassword('SuperAdmin123!');
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@medicare.tn' },
    update: {},
    create: {
      email: 'admin@medicare.tn',
      password: superAdminPassword,
      role: 'SUPER_ADMIN',
      isEmailVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Super Admin created:', superAdmin.email);

  // Create Demo Cabinet
  const cabinetAdminPassword = await hashPassword('CabinetAdmin123!');
  const cabinetAdmin = await prisma.user.create({
    data: {
      email: 'cabinet@demo.tn',
      password: cabinetAdminPassword,
      role: 'ADMIN_CABINET',
      isEmailVerified: true,
      isActive: true,
    },
  });

  const demoCabinet = await prisma.cabinet.create({
    data: {
      name: 'Cabinet Médical Demo',
      slug: 'cabinet-medical-demo',
      email: 'contact@cabinet-demo.tn',
      phone: '+21612345678',
      address: '123 Avenue Habib Bourguiba',
      city: 'Tunis',
      postalCode: '1000',
      country: 'TN',
      adminId: cabinetAdmin.id,
      subscriptionPlan: 'PREMIUM',
      subscriptionStatus: 'ACTIVE',
      allowOnlineBooking: true,
    },
  });

  console.log('✅ Demo Cabinet created:', demoCabinet.name);

  // Create Demo Practitioner
  const practitionerPassword = await hashPassword('Practitioner123!');
  const practitionerUser = await prisma.user.create({
    data: {
      email: 'dr.smith@demo.tn',
      password: practitionerPassword,
      role: 'PRACTITIONER',
      isEmailVerified: true,
      isActive: true,
    },
  });

  const practitioner = await prisma.practitioner.create({
    data: {
      userId: practitionerUser.id,
      cabinetId: demoCabinet.id,
      firstName: 'Ahmed',
      lastName: 'Ben Ali',
      title: 'Dr.',
      speciality: 'GENERAL_PRACTITIONER',
      licenseNumber: 'TN-12345',
      consultationFee: 50,
      allowTeleconsultation: true,
      teleconsultationFee: 40,
      bio: 'Médecin généraliste avec 10 ans d\'expérience',
      color: '#1976d2',
    },
  });

  console.log('✅ Demo Practitioner created:', `${practitioner.firstName} ${practitioner.lastName}`);

  // Create Schedule for Practitioner
  const schedule = [
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
    { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wednesday
    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
    { dayOfWeek: 5, startTime: '09:00', endTime: '13:00' }, // Friday (half day)
  ];

  await prisma.schedule.createMany({
    data: schedule.map(s => ({
      ...s,
      practitionerId: practitioner.id,
      cabinetId: demoCabinet.id,
    })),
  });

  console.log('✅ Schedule created for practitioner');

  // Create Demo Secretary
  const secretaryPassword = await hashPassword('Secretary123!');
  const secretaryUser = await prisma.user.create({
    data: {
      email: 'secretary@demo.tn',
      password: secretaryPassword,
      role: 'SECRETARY',
      isEmailVerified: true,
      isActive: true,
    },
  });

  const secretary = await prisma.secretary.create({
    data: {
      userId: secretaryUser.id,
      cabinetId: demoCabinet.id,
      firstName: 'Fatma',
      lastName: 'Jrad',
      phone: '+21612345679',
    },
  });

  console.log('✅ Demo Secretary created:', `${secretary.firstName} ${secretary.lastName}`);

  // Create Demo Patients
  const patientPassword = await hashPassword('Patient123!');

  const patients = [];
  for (let i = 1; i <= 5; i++) {
    const patientUser = await prisma.user.create({
      data: {
        email: `patient${i}@demo.tn`,
        password: patientPassword,
        phone: `+2161234567${i}`,
        role: 'PATIENT',
        isEmailVerified: true,
        isActive: true,
      },
    });

    const patient = await prisma.patient.create({
      data: {
        userId: patientUser.id,
        cabinetId: demoCabinet.id,
        firstName: `Patient${i}`,
        lastName: `Demo`,
        dateOfBirth: new Date(1990 + i, i, i),
        gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
        email: `patient${i}@demo.tn`,
        phone: `+2161234567${i}`,
        bloodGroup: ['A_POSITIVE', 'O_POSITIVE', 'B_POSITIVE', 'AB_POSITIVE', 'A_NEGATIVE'][i - 1] as any,
        address: `${i} Rue de la Liberté`,
        city: 'Tunis',
      },
    });

    patients.push(patient);
  }

  console.log(`✅ ${patients.length} Demo Patients created`);

  // Create Demo Rooms
  const rooms = await prisma.room.createMany({
    data: [
      {
        cabinetId: demoCabinet.id,
        name: 'Salle 1',
        description: 'Salle de consultation principale',
        floor: 'RDC',
      },
      {
        cabinetId: demoCabinet.id,
        name: 'Salle 2',
        description: 'Salle de consultation secondaire',
        floor: 'RDC',
      },
    ],
  });

  console.log('✅ Demo Rooms created');

  // Create Demo Appointments
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const appointment1 = await prisma.appointment.create({
    data: {
      cabinetId: demoCabinet.id,
      practitionerId: practitioner.id,
      patientId: patients[0].id,
      type: 'CONSULTATION',
      status: 'SCHEDULED',
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 30 * 60000),
      duration: 30,
      reason: 'Consultation de suivi',
    },
  });

  console.log('✅ Demo Appointments created');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Demo Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Super Admin:');
  console.log('  Email: admin@medicare.tn');
  console.log('  Password: SuperAdmin123!');
  console.log('\nCabinet Admin:');
  console.log('  Email: cabinet@demo.tn');
  console.log('  Password: CabinetAdmin123!');
  console.log('\nPractitioner:');
  console.log('  Email: dr.smith@demo.tn');
  console.log('  Password: Practitioner123!');
  console.log('\nSecretary:');
  console.log('  Email: secretary@demo.tn');
  console.log('  Password: Secretary123!');
  console.log('\nPatient (example):');
  console.log('  Email: patient1@demo.tn');
  console.log('  Password: Patient123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
