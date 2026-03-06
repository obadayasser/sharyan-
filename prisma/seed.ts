import { PrismaClient, BloodType, Gender, BloodBankStatus, BloodRequestStatus, BloodRequestUrgency, DonationOfferStatus, CampaignStatus, NotificationType, StockLevel, BadgeType, Donor, Patient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.chatMessage.deleteMany();
  await prisma.chatParticipant.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.pointTransaction.deleteMany();
  await prisma.donorBadge.deleteMany();
  await prisma.campaignRegistration.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.shortageAlert.deleteMany();
  await prisma.bloodStock.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.donationOffer.deleteMany();
  await prisma.bloodRequest.deleteMany();
  await prisma.smsLog.deleteMany();
  await prisma.appSetting.deleteMany();
  await prisma.bloodBank.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.donor.deleteMany();
  await prisma.admin.deleteMany();

  // ─── ADMINS ────────────────────────────────────────────
  const superAdmin = await prisma.admin.create({
    data: {
      email: 'admin@sharyan.app',
      passwordHash: await bcrypt.hash('Admin@123456', 10),
      firstName: 'Super',
      lastName: 'Admin',
      isSuperAdmin: true,
    },
  });

  const moderator = await prisma.admin.create({
    data: {
      email: 'moderator@sharyan.app',
      passwordHash: await bcrypt.hash('Mod@123456', 10),
      firstName: 'Moderator',
      lastName: 'User',
      isSuperAdmin: false,
    },
  });

  console.log('Admins seeded');

  // ─── DONORS ────────────────────────────────────────────
  const donorData = [
    { name: 'Ahmed Al-Otaibi', mobile: '+966501111111', bloodType: BloodType.O_NEGATIVE, gender: Gender.MALE, latitude: 24.7136, longitude: 46.6753 },
    { name: 'Mohammed Al-Harbi', mobile: '+966502222222', bloodType: BloodType.O_NEGATIVE, gender: Gender.MALE, latitude: 24.7256, longitude: 46.6853 },
    { name: 'Fahad Al-Qahtani', mobile: '+966503333333', bloodType: BloodType.O_POSITIVE, gender: Gender.MALE, latitude: 24.7350, longitude: 46.6900 },
    { name: 'Khalid Al-Dosari', mobile: '+966504444444', bloodType: BloodType.O_POSITIVE, gender: Gender.MALE, latitude: 24.7050, longitude: 46.6650 },
    { name: 'Sara Al-Mutairi', mobile: '+966505555555', bloodType: BloodType.A_POSITIVE, gender: Gender.FEMALE, latitude: 24.7400, longitude: 46.7000 },
    { name: 'Nora Al-Shammari', mobile: '+966506666666', bloodType: BloodType.A_POSITIVE, gender: Gender.FEMALE, latitude: 24.7200, longitude: 46.6600 },
    { name: 'Abdullah Al-Zahrani', mobile: '+966507777777', bloodType: BloodType.A_NEGATIVE, gender: Gender.MALE, latitude: 24.7100, longitude: 46.6500 },
    { name: 'Omar Al-Ghamdi', mobile: '+966508888888', bloodType: BloodType.A_NEGATIVE, gender: Gender.MALE, latitude: 24.7300, longitude: 46.6800 },
    { name: 'Faisal Al-Rashidi', mobile: '+966509999999', bloodType: BloodType.B_POSITIVE, gender: Gender.MALE, latitude: 24.7450, longitude: 46.7100 },
    { name: 'Yousef Al-Anazi', mobile: '+966510000000', bloodType: BloodType.B_POSITIVE, gender: Gender.MALE, latitude: 24.7000, longitude: 46.6400 },
    { name: 'Maha Al-Subaie', mobile: '+966511111111', bloodType: BloodType.B_NEGATIVE, gender: Gender.FEMALE, latitude: 24.7150, longitude: 46.6700 },
    { name: 'Hassan Al-Malki', mobile: '+966512222222', bloodType: BloodType.AB_POSITIVE, gender: Gender.MALE, latitude: 24.7250, longitude: 46.6950 },
    { name: 'Ali Al-Balawi', mobile: '+966513333333', bloodType: BloodType.AB_POSITIVE, gender: Gender.MALE, latitude: 24.7350, longitude: 46.7050 },
    { name: 'Layla Al-Juhani', mobile: '+966514444444', bloodType: BloodType.AB_NEGATIVE, gender: Gender.FEMALE, latitude: 24.7180, longitude: 46.6780 },
    { name: 'Reem Al-Tamimi', mobile: '+966515555555', bloodType: BloodType.AB_NEGATIVE, gender: Gender.FEMALE, latitude: 24.7080, longitude: 46.6580 },
  ];

  const donors: Donor[] = [];
  for (let i = 0; i < donorData.length; i++) {
    const d = donorData[i];
    const lastDonation = i < 12 ? (i % 3 === 0 ? null : new Date(Date.now() - (i * 15 + 60) * 24 * 60 * 60 * 1000)) : null;
    const donor = await prisma.donor.create({
      data: {
        deviceId: `device-donor-${i + 1}`,
        ...d,
        isAvailable: i < 12,
        lastDonationDate: lastDonation,
        totalDonations: Math.floor(i / 3),
        points: Math.floor(i / 3) * 100,
      },
    });
    donors.push(donor);
  }

  console.log('Donors seeded:', donors.length);

  // ─── PATIENTS ──────────────────────────────────────────
  const patientData = [
    { name: 'Saleh Al-Dossary', mobile: '+966520111111', latitude: 24.7200, longitude: 46.6700 },
    { name: 'Ibrahim Al-Otaibi', mobile: '+966520222222', latitude: 24.7300, longitude: 46.6800 },
    { name: 'Huda Al-Qahtani', mobile: '+966520333333', latitude: 24.7100, longitude: 46.6600 },
    { name: 'Majed Al-Harbi', mobile: '+966520444444', latitude: 24.7400, longitude: 46.7000 },
    { name: 'Aisha Al-Mutairi', mobile: '+966520555555', latitude: 24.7050, longitude: 46.6500 },
  ];

  const patients: Patient[] = [];
  for (let i = 0; i < patientData.length; i++) {
    const p = await prisma.patient.create({
      data: {
        deviceId: `device-patient-${i + 1}`,
        ...patientData[i],
      },
    });
    patients.push(p);
  }

  console.log('Patients seeded:', patients.length);

  // ─── BLOOD BANKS ───────────────────────────────────────
  const bank1 = await prisma.bloodBank.create({
    data: {
      deviceId: 'device-bank-1',
      name: 'King Fahad Medical City Blood Bank',
      nameAr: 'بنك الدم بمدينة الملك فهد الطبية',
      phone: '+966112345678',
      email: 'blood@kfmc.sa',
      latitude: 24.6588,
      longitude: 46.6741,
      address: 'King Fahad Road, Riyadh',
      city: 'Riyadh',
      status: BloodBankStatus.APPROVED,
      licenseNumber: 'BB-001',
      approvedAt: new Date(),
      approvedById: superAdmin.id,
    },
  });

  const bank2 = await prisma.bloodBank.create({
    data: {
      deviceId: 'device-bank-2',
      name: 'Red Crescent Riyadh',
      nameAr: 'الهلال الأحمر بالرياض',
      phone: '+966113456789',
      latitude: 24.7235,
      longitude: 46.6390,
      address: 'Al Olaya, Riyadh',
      city: 'Riyadh',
      status: BloodBankStatus.APPROVED,
      licenseNumber: 'BB-002',
      approvedAt: new Date(),
      approvedById: superAdmin.id,
    },
  });

  const bank3 = await prisma.bloodBank.create({
    data: {
      deviceId: 'device-bank-3',
      name: 'Al Habib Hospital Blood Center',
      nameAr: 'مركز الدم بمستشفى الحبيب',
      phone: '+966114567890',
      latitude: 24.7500,
      longitude: 46.7200,
      address: 'Exit 5, Riyadh',
      city: 'Riyadh',
      status: BloodBankStatus.PENDING,
      licenseNumber: 'BB-003',
    },
  });

  console.log('Blood banks seeded');

  // ─── BLOOD STOCK ───────────────────────────────────────
  const bloodTypes = Object.values(BloodType);
  const stockLevels = [StockLevel.HIGH, StockLevel.ADEQUATE, StockLevel.LOW, StockLevel.CRITICAL, StockLevel.HIGH, StockLevel.ADEQUATE, StockLevel.LOW, StockLevel.ADEQUATE];

  for (let i = 0; i < bloodTypes.length; i++) {
    await prisma.bloodStock.create({
      data: {
        bloodBankId: bank1.id,
        bloodType: bloodTypes[i],
        bagsCount: Math.floor(Math.random() * 30) + 1,
        stockLevel: stockLevels[i],
      },
    });
    await prisma.bloodStock.create({
      data: {
        bloodBankId: bank2.id,
        bloodType: bloodTypes[i],
        bagsCount: Math.floor(Math.random() * 20) + 1,
        stockLevel: stockLevels[(i + 2) % stockLevels.length],
      },
    });
  }

  console.log('Blood stock seeded');

  // ─── BLOOD REQUESTS ────────────────────────────────────
  const request1 = await prisma.bloodRequest.create({
    data: {
      patientId: patients[0].id,
      bloodType: BloodType.O_NEGATIVE,
      bagsNeeded: 3,
      urgency: BloodRequestUrgency.EMERGENCY,
      status: BloodRequestStatus.OPEN,
      patientName: 'Saleh Al-Dossary',
      hospitalName: 'King Fahad Medical City',
      latitude: 24.6588,
      longitude: 46.6741,
      contactPhone: '+966520111111',
      shareToken: 'share-token-emergency-1',
    },
  });

  const request2 = await prisma.bloodRequest.create({
    data: {
      patientId: patients[1].id,
      bloodType: BloodType.A_POSITIVE,
      bagsNeeded: 2,
      urgency: BloodRequestUrgency.URGENT,
      status: BloodRequestStatus.OPEN,
      patientName: 'Ibrahim Al-Otaibi',
      hospitalName: 'Red Crescent',
      latitude: 24.7235,
      longitude: 46.6390,
      contactPhone: '+966520222222',
      shareToken: 'share-token-urgent-2',
    },
  });

  const request3 = await prisma.bloodRequest.create({
    data: {
      patientId: patients[2].id,
      bloodType: BloodType.B_POSITIVE,
      bagsNeeded: 3,
      bagsFulfilled: 1,
      urgency: BloodRequestUrgency.NORMAL,
      status: BloodRequestStatus.PARTIALLY_FULFILLED,
      patientName: 'Huda Al-Qahtani',
      hospitalName: 'Al Habib Hospital',
      latitude: 24.7500,
      longitude: 46.7200,
      contactPhone: '+966520333333',
      shareToken: 'share-token-normal-3',
    },
  });

  const request4 = await prisma.bloodRequest.create({
    data: {
      patientId: patients[3].id,
      bloodType: BloodType.AB_POSITIVE,
      bagsNeeded: 1,
      bagsFulfilled: 1,
      urgency: BloodRequestUrgency.NORMAL,
      status: BloodRequestStatus.FULFILLED,
      patientName: 'Majed Al-Harbi',
      hospitalName: 'King Fahad Medical City',
      latitude: 24.6588,
      longitude: 46.6741,
      contactPhone: '+966520444444',
      shareToken: 'share-token-fulfilled-4',
    },
  });

  const request5 = await prisma.bloodRequest.create({
    data: {
      patientId: patients[4].id,
      bloodType: BloodType.O_POSITIVE,
      bagsNeeded: 2,
      urgency: BloodRequestUrgency.NORMAL,
      status: BloodRequestStatus.EXPIRED,
      patientName: 'Aisha Al-Mutairi',
      latitude: 24.7050,
      longitude: 46.6500,
      shareToken: 'share-token-expired-5',
    },
  });

  console.log('Blood requests seeded');

  // ─── DONATION OFFERS ───────────────────────────────────
  const offer1 = await prisma.donationOffer.create({
    data: { bloodRequestId: request1.id, donorId: donors[0].id, status: DonationOfferStatus.PENDING },
  });
  const offer2 = await prisma.donationOffer.create({
    data: { bloodRequestId: request1.id, donorId: donors[1].id, status: DonationOfferStatus.PENDING },
  });
  const offer3 = await prisma.donationOffer.create({
    data: { bloodRequestId: request2.id, donorId: donors[4].id, status: DonationOfferStatus.ACCEPTED, respondedAt: new Date() },
  });
  const offer4 = await prisma.donationOffer.create({
    data: { bloodRequestId: request2.id, donorId: donors[5].id, status: DonationOfferStatus.ACCEPTED, respondedAt: new Date() },
  });
  const offer5 = await prisma.donationOffer.create({
    data: { bloodRequestId: request3.id, donorId: donors[8].id, status: DonationOfferStatus.COMPLETED, respondedAt: new Date() },
  });
  const offer6 = await prisma.donationOffer.create({
    data: { bloodRequestId: request4.id, donorId: donors[11].id, status: DonationOfferStatus.COMPLETED, respondedAt: new Date() },
  });
  const offer7 = await prisma.donationOffer.create({
    data: { bloodRequestId: request3.id, donorId: donors[9].id, status: DonationOfferStatus.REJECTED, respondedAt: new Date() },
  });
  const offer8 = await prisma.donationOffer.create({
    data: { bloodRequestId: request5.id, donorId: donors[2].id, status: DonationOfferStatus.CANCELLED },
  });

  console.log('Donation offers seeded');

  // ─── DONATIONS ─────────────────────────────────────────
  await prisma.donation.create({
    data: {
      donorId: donors[8].id,
      donationOfferId: offer5.id,
      bloodType: BloodType.B_POSITIVE,
      hospitalName: 'Al Habib Hospital',
      pointsAwarded: 100,
      donatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.donation.create({
    data: {
      donorId: donors[11].id,
      donationOfferId: offer6.id,
      bloodType: BloodType.AB_POSITIVE,
      hospitalName: 'King Fahad Medical City',
      pointsAwarded: 100,
      donatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.donation.create({
    data: {
      donorId: donors[0].id,
      bloodType: BloodType.O_NEGATIVE,
      hospitalName: 'King Fahad Medical City',
      pointsAwarded: 100,
      donatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      verifiedByAdminId: superAdmin.id,
    },
  });

  await prisma.donation.create({
    data: {
      donorId: donors[4].id,
      bloodType: BloodType.A_POSITIVE,
      hospitalName: 'Red Crescent',
      pointsAwarded: 100,
      donatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      verifiedByAdminId: moderator.id,
    },
  });

  console.log('Donations seeded');

  // ─── CAMPAIGNS ─────────────────────────────────────────
  const campaign1 = await prisma.campaign.create({
    data: {
      bloodBankId: bank1.id,
      title: 'World Blood Donor Day Campaign',
      titleAr: 'حملة اليوم العالمي للمتبرعين بالدم',
      description: 'Join us to celebrate World Blood Donor Day. All blood types welcome!',
      latitude: 24.6588,
      longitude: 46.6741,
      address: 'King Fahad Medical City, Riyadh',
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      targetBags: 100,
      collectedBags: 35,
      status: CampaignStatus.ACTIVE,
      bloodTypes: [BloodType.O_POSITIVE, BloodType.O_NEGATIVE, BloodType.A_POSITIVE, BloodType.B_POSITIVE],
    },
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      bloodBankId: bank2.id,
      title: 'Ramadan Blood Drive',
      titleAr: 'حملة التبرع بالدم في رمضان',
      description: 'Special blood donation drive during the holy month of Ramadan.',
      latitude: 24.7235,
      longitude: 46.6390,
      address: 'Red Crescent, Al Olaya, Riyadh',
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 44 * 24 * 60 * 60 * 1000),
      targetBags: 200,
      status: CampaignStatus.UPCOMING,
      bloodTypes: Object.values(BloodType),
    },
  });

  const campaign3 = await prisma.campaign.create({
    data: {
      bloodBankId: bank1.id,
      title: 'Emergency O- Blood Drive',
      titleAr: 'حملة طوارئ لفصيلة O-',
      description: 'Critical shortage of O- blood. Urgent donations needed!',
      latitude: 24.6588,
      longitude: 46.6741,
      address: 'King Fahad Medical City, Riyadh',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000),
      targetBags: 50,
      collectedBags: 42,
      status: CampaignStatus.COMPLETED,
      bloodTypes: [BloodType.O_NEGATIVE],
    },
  });

  console.log('Campaigns seeded');

  // ─── CAMPAIGN REGISTRATIONS ────────────────────────────
  for (let i = 0; i < 6; i++) {
    await prisma.campaignRegistration.create({
      data: {
        campaignId: campaign1.id,
        donorId: donors[i].id,
        attended: i < 3,
      },
    });
  }
  for (let i = 3; i < 5; i++) {
    await prisma.campaignRegistration.create({
      data: {
        campaignId: campaign2.id,
        donorId: donors[i].id,
      },
    });
  }

  console.log('Campaign registrations seeded');

  // ─── SHORTAGE ALERTS ───────────────────────────────────
  await prisma.shortageAlert.create({
    data: {
      bloodBankId: bank1.id,
      bloodType: BloodType.O_NEGATIVE,
      message: 'Critical shortage of O- blood. Urgent donations needed at King Fahad Medical City.',
    },
  });

  await prisma.shortageAlert.create({
    data: {
      bloodBankId: bank2.id,
      bloodType: BloodType.B_NEGATIVE,
      message: 'Low supply of B- blood at Red Crescent.',
      isResolved: true,
      resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('Shortage alerts seeded');

  // ─── BADGES ────────────────────────────────────────────
  await prisma.donorBadge.create({
    data: { donorId: donors[0].id, badge: BadgeType.FIRST_DONATION },
  });
  await prisma.donorBadge.create({
    data: { donorId: donors[4].id, badge: BadgeType.FIRST_DONATION },
  });
  await prisma.donorBadge.create({
    data: { donorId: donors[8].id, badge: BadgeType.FIRST_DONATION },
  });
  await prisma.donorBadge.create({
    data: { donorId: donors[11].id, badge: BadgeType.FIRST_DONATION },
  });

  console.log('Badges seeded');

  // ─── POINT TRANSACTIONS ────────────────────────────────
  await prisma.pointTransaction.create({
    data: { donorId: donors[0].id, points: 100, reason: 'Blood donation' },
  });
  await prisma.pointTransaction.create({
    data: { donorId: donors[4].id, points: 100, reason: 'Blood donation' },
  });
  await prisma.pointTransaction.create({
    data: { donorId: donors[8].id, points: 100, reason: 'Blood donation' },
  });
  await prisma.pointTransaction.create({
    data: { donorId: donors[11].id, points: 100, reason: 'Blood donation' },
  });

  console.log('Point transactions seeded');

  // ─── NOTIFICATIONS ─────────────────────────────────────
  await prisma.notification.create({
    data: {
      donorId: donors[0].id,
      type: NotificationType.EMERGENCY_REQUEST,
      title: 'Emergency Blood Request',
      titleAr: 'طلب دم طارئ',
      body: 'A patient urgently needs O- blood at King Fahad Medical City.',
      bodyAr: 'مريض يحتاج بشكل عاجل لفصيلة O- في مدينة الملك فهد الطبية.',
      data: { requestId: request1.id },
    },
  });

  await prisma.notification.create({
    data: {
      donorId: donors[1].id,
      type: NotificationType.EMERGENCY_REQUEST,
      title: 'Emergency Blood Request',
      body: 'A patient urgently needs O- blood at King Fahad Medical City.',
      data: { requestId: request1.id },
    },
  });

  await prisma.notification.create({
    data: {
      patientId: patients[0].id,
      type: NotificationType.DONATION_OFFER,
      title: 'New Donation Offer',
      titleAr: 'عرض تبرع جديد',
      body: 'A donor has offered to help with your blood request.',
      bodyAr: 'متبرع عرض المساعدة في طلب الدم الخاص بك.',
      data: { offerId: offer1.id },
      isRead: true,
    },
  });

  await prisma.notification.create({
    data: {
      donorId: donors[8].id,
      type: NotificationType.BADGE_EARNED,
      title: 'Badge Earned!',
      titleAr: 'حصلت على شارة!',
      body: 'Congratulations! You earned the First Donation badge.',
      bodyAr: 'مبروك! حصلت على شارة أول تبرع.',
    },
  });

  await prisma.notification.create({
    data: {
      donorId: donors[0].id,
      type: NotificationType.SHORTAGE_ALERT,
      title: 'Blood Shortage Alert',
      titleAr: 'تنبيه نقص في الدم',
      body: 'Critical shortage of O- blood in your area.',
      bodyAr: 'نقص حاد في فصيلة O- في منطقتك.',
    },
  });

  console.log('Notifications seeded');

  // ─── CHAT ROOMS ────────────────────────────────────────
  const room1 = await prisma.chatRoom.create({
    data: {
      bloodRequestId: request1.id,
      participants: {
        create: [
          { donorId: donors[0].id },
          { patientId: patients[0].id },
        ],
      },
    },
  });

  const room2 = await prisma.chatRoom.create({
    data: {
      bloodRequestId: request3.id,
      participants: {
        create: [
          { donorId: donors[8].id },
          { patientId: patients[2].id },
        ],
      },
    },
  });

  // Chat messages for room 1
  const messages1 = [
    { senderId: patients[0].id, senderType: 'PATIENT' as const, content: 'Hello, I urgently need O- blood. Can you help?' },
    { senderId: donors[0].id, senderType: 'DONOR' as const, content: 'Yes, I am O- and available. Which hospital?' },
    { senderId: patients[0].id, senderType: 'PATIENT' as const, content: 'King Fahad Medical City, blood bank on the 2nd floor.' },
    { senderId: donors[0].id, senderType: 'DONOR' as const, content: 'I can be there in 30 minutes.' },
    { senderId: patients[0].id, senderType: 'PATIENT' as const, content: 'Thank you so much! God bless you.' },
  ];

  for (let i = 0; i < messages1.length; i++) {
    await prisma.chatMessage.create({
      data: {
        chatRoomId: room1.id,
        ...messages1[i],
        createdAt: new Date(Date.now() - (5 - i) * 60 * 1000),
      },
    });
  }

  // Chat messages for room 2
  const messages2 = [
    { senderId: patients[2].id, senderType: 'PATIENT' as const, content: 'I need B+ blood, 3 bags. Already got 1.' },
    { senderId: donors[8].id, senderType: 'DONOR' as const, content: 'I am B+ and I donated recently but I can ask my friends.' },
    { senderId: patients[2].id, senderType: 'PATIENT' as const, content: 'That would be very helpful, thank you!' },
    { senderId: donors[8].id, senderType: 'DONOR' as const, content: 'My friend Yousef is also B+ and available.' },
    { senderId: patients[2].id, senderType: 'PATIENT' as const, content: 'Please ask him to come to Al Habib Hospital.' },
  ];

  for (let i = 0; i < messages2.length; i++) {
    await prisma.chatMessage.create({
      data: {
        chatRoomId: room2.id,
        ...messages2[i],
        createdAt: new Date(Date.now() - (10 - i) * 60 * 1000),
      },
    });
  }

  console.log('Chat rooms and messages seeded');

  // ─── APP SETTINGS ──────────────────────────────────────
  const settings = [
    { key: 'MIN_DONATION_INTERVAL_DAYS', value: '56' },
    { key: 'POINTS_PER_DONATION', value: '100' },
    { key: 'EMERGENCY_SEARCH_RADIUS_KM', value: '10' },
    { key: 'DEFAULT_SEARCH_RADIUS_KM', value: '5' },
    { key: 'MAX_SEARCH_RADIUS_KM', value: '50' },
  ];

  for (const s of settings) {
    await prisma.appSetting.create({ data: s });
  }

  console.log('App settings seeded');
  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
