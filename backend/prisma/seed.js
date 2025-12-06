const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Créer des utilisateurs
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@metro.fr' },
    update: {},
    create: {
      email: 'admin@metro.fr',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Système',
      role: 'ADMIN',
    },
  });

  const responsable = await prisma.user.upsert({
    where: { email: 'responsable@metro.fr' },
    update: {},
    create: {
      email: 'responsable@metro.fr',
      password: hashedPassword,
      firstName: 'Marie',
      lastName: 'Dupont',
      role: 'RESPONSABLE_METROLOGIE',
    },
  });

  const technicien = await prisma.user.upsert({
    where: { email: 'technicien@metro.fr' },
    update: {},
    create: {
      email: 'technicien@metro.fr',
      password: hashedPassword,
      firstName: 'Jean',
      lastName: 'Martin',
      role: 'TECHNICIEN',
    },
  });

  console.log('✅ Utilisateurs créés');

  // Créer des sites
  const siteParis = await prisma.site.create({
    data: {
      name: 'Site Paris',
      address: '123 Avenue des Champs-Élysées',
      city: 'Paris',
      postalCode: '75008',
      country: 'France',
    },
  });

  const siteLyon = await prisma.site.create({
    data: {
      name: 'Site Lyon',
      address: '45 Rue de la République',
      city: 'Lyon',
      postalCode: '69002',
      country: 'France',
    },
  });

  console.log('✅ Sites créés');

  // Créer des types d'instruments
  const typePied = await prisma.instrumentType.create({
    data: {
      name: 'Pied à coulisse',
      description: 'Instrument de mesure de longueur',
    },
  });

  const typeMicro = await prisma.instrumentType.create({
    data: {
      name: 'Micromètre',
      description: 'Instrument de mesure de précision',
    },
  });

  const typeBalance = await prisma.instrumentType.create({
    data: {
      name: 'Balance',
      description: 'Instrument de mesure de masse',
    },
  });

  const typeThermo = await prisma.instrumentType.create({
    data: {
      name: 'Thermomètre',
      description: 'Instrument de mesure de température',
    },
  });

  console.log('✅ Types d\'instruments créés');

  // Créer des fournisseurs
  const fournisseur1 = await prisma.supplier.create({
    data: {
      name: 'Métrologie France',
      contactName: 'Pierre Durand',
      email: 'contact@metrologie-france.fr',
      phone: '01 23 45 67 89',
      address: '10 Rue de l\'Industrie',
      city: 'Paris',
      postalCode: '75010',
      country: 'France',
      accreditations: ['COFRAC', 'ISO 17025'],
      notes: 'Fournisseur principal pour les étalonnages',
    },
  });

  const fournisseur2 = await prisma.supplier.create({
    data: {
      name: 'Calibration Services',
      contactName: 'Sophie Moreau',
      email: 'contact@calibration-services.fr',
      phone: '04 56 78 90 12',
      address: '25 Boulevard de la Mesure',
      city: 'Lyon',
      postalCode: '69003',
      country: 'France',
      accreditations: ['COFRAC'],
      notes: 'Spécialisé dans les balances',
    },
  });

  console.log('✅ Fournisseurs créés');

  // Créer des instruments
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

  const instrument1 = await prisma.instrument.create({
    data: {
      serialNumber: 'PC-2024-001',
      internalReference: 'INT-001',
      name: 'Pied à coulisse digital 300mm',
      brand: 'Mitutoyo',
      model: 'CD-30C',
      status: 'CONFORME',
      calibrationPeriod: 12,
      nextCalibrationDate: nextMonth,
      location: 'Atelier A',
      purchaseDate: new Date('2023-01-15'),
      purchasePrice: 350.50,
      typeId: typePied.id,
      siteId: siteParis.id,
    },
  });

  const instrument2 = await prisma.instrument.create({
    data: {
      serialNumber: 'MC-2024-002',
      internalReference: 'INT-002',
      name: 'Micromètre extérieur 0-25mm',
      brand: 'Starrett',
      model: 'T230XRL',
      status: 'CONFORME',
      calibrationPeriod: 12,
      nextCalibrationDate: twoMonthsAgo,
      location: 'Laboratoire métrologie',
      purchaseDate: new Date('2022-06-10'),
      purchasePrice: 280.00,
      typeId: typeMicro.id,
      siteId: siteParis.id,
    },
  });

  const instrument3 = await prisma.instrument.create({
    data: {
      serialNumber: 'BAL-2024-003',
      internalReference: 'INT-003',
      name: 'Balance de précision 200g',
      brand: 'Sartorius',
      model: 'Entris II',
      status: 'CONFORME',
      calibrationPeriod: 6,
      nextCalibrationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      location: 'Salle blanche',
      purchaseDate: new Date('2023-09-20'),
      purchasePrice: 1250.00,
      typeId: typeBalance.id,
      siteId: siteLyon.id,
    },
  });

  const instrument4 = await prisma.instrument.create({
    data: {
      serialNumber: 'THM-2024-004',
      internalReference: 'INT-004',
      name: 'Thermomètre numérique -50/+200°C',
      brand: 'Testo',
      model: '735-2',
      status: 'EN_MAINTENANCE',
      calibrationPeriod: 12,
      location: 'En maintenance',
      purchaseDate: new Date('2021-03-10'),
      purchasePrice: 450.00,
      typeId: typeThermo.id,
      siteId: siteLyon.id,
    },
  });

  console.log('✅ Instruments créés');

  // Créer des interventions
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  await prisma.intervention.create({
    data: {
      instrumentId: instrument1.id,
      type: 'ETALONNAGE',
      status: 'TERMINEE',
      scheduledDate: oneMonthAgo,
      completedDate: oneMonthAgo,
      conformityResult: 'CONFORME',
      cost: 95.00,
      certificateNumber: 'CERT-2024-001',
      nextCalibrationDate: nextMonth,
      supplierId: fournisseur1.id,
      createdById: responsable.id,
      observations: 'Étalonnage réalisé conformément à la procédure',
    },
  });

  await prisma.intervention.create({
    data: {
      instrumentId: instrument2.id,
      type: 'ETALONNAGE',
      status: 'PLANIFIEE',
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      supplierId: fournisseur1.id,
      createdById: responsable.id,
    },
  });

  await prisma.intervention.create({
    data: {
      instrumentId: instrument3.id,
      type: 'ETALONNAGE',
      status: 'TERMINEE',
      scheduledDate: new Date('2024-09-15'),
      completedDate: new Date('2024-09-15'),
      conformityResult: 'CONFORME',
      cost: 150.00,
      certificateNumber: 'CERT-2024-002',
      nextCalibrationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      supplierId: fournisseur2.id,
      createdById: technicien.id,
    },
  });

  await prisma.intervention.create({
    data: {
      instrumentId: instrument4.id,
      type: 'REPARATION',
      status: 'EN_COURS',
      scheduledDate: new Date(),
      supplierId: fournisseur1.id,
      createdById: technicien.id,
      observations: 'Écran défectueux - remplacement nécessaire',
    },
  });

  console.log('✅ Interventions créées');

  // Créer des mouvements
  await prisma.movement.create({
    data: {
      instrumentId: instrument2.id,
      type: 'ENLEVEMENT',
      movementDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      expectedReturn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deliveryNote: 'BL-2024-001',
      destination: 'Métrologie France',
      createdById: technicien.id,
      observations: 'Envoi pour étalonnage',
    },
  });

  await prisma.movement.create({
    data: {
      instrumentId: instrument4.id,
      type: 'ENLEVEMENT',
      movementDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      expectedReturn: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      deliveryNote: 'BL-2024-002',
      destination: 'Métrologie France - Atelier réparation',
      createdById: technicien.id,
      observations: 'Envoi pour réparation écran',
    },
  });

  console.log('✅ Mouvements créés');

  console.log('');
  console.log('🎉 Seeding terminé avec succès!');
  console.log('');
  console.log('📝 Comptes de test créés:');
  console.log('   Admin: admin@metro.fr / password123');
  console.log('   Responsable: responsable@metro.fr / password123');
  console.log('   Technicien: technicien@metro.fr / password123');
  console.log('');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

