import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixCalibrationDates() {
  console.log('🔧 Correction des dates d\'étalonnage...');

  try {
    // Récupérer tous les instruments avec des dates d'étalonnage problématiques
    const instruments = await prisma.instrument.findMany({
      where: {
        OR: [
          { nextCalibrationDate: null },
          {
            nextCalibrationDate: {
              gt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Plus d'un an dans le futur
            }
          }
        ]
      }
    });

    console.log(`📊 ${instruments.length} instruments à corriger`);

    for (const instrument of instruments) {
      // Calculer une nouvelle date d'étalonnage basée sur la date actuelle
      const now = new Date();
      let nextCalibrationDate: Date;

      // Utiliser la fréquence définie ou une valeur par défaut raisonnable
      const frequencyValue = instrument.calibrationFrequencyValue || 12;
      const frequencyUnit = instrument.calibrationFrequencyUnit || 'MONTHS';

      switch (frequencyUnit) {
        case 'DAYS':
          nextCalibrationDate = new Date(now.getTime() + frequencyValue * 24 * 60 * 60 * 1000);
          break;
        case 'WEEKS':
          nextCalibrationDate = new Date(now.getTime() + frequencyValue * 7 * 24 * 60 * 60 * 1000);
          break;
        case 'MONTHS':
          nextCalibrationDate = new Date(now);
          nextCalibrationDate.setMonth(nextCalibrationDate.getMonth() + frequencyValue);
          break;
        case 'YEARS':
          nextCalibrationDate = new Date(now);
          nextCalibrationDate.setFullYear(nextCalibrationDate.getFullYear() + frequencyValue);
          break;
        default:
          // Valeur par défaut : 6 mois
          nextCalibrationDate = new Date(now);
          nextCalibrationDate.setMonth(nextCalibrationDate.getMonth() + 6);
      }

      // Mettre à jour l'instrument
      await prisma.instrument.update({
        where: { id: instrument.id },
        data: { 
          nextCalibrationDate,
          calibrationFrequencyValue: frequencyValue,
          calibrationFrequencyUnit: frequencyUnit
        }
      });

      console.log(`✅ ${instrument.name} (${instrument.serialNumber}) : ${nextCalibrationDate.toLocaleDateString('fr-FR')}`);
    }

    console.log('🎉 Correction terminée !');
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCalibrationDates();
