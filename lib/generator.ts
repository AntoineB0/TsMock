import { faker } from '@faker-js/faker';
import type { Field, DateFormat, GeneratedRow, DistributionType } from '@/types';

/**
 * Génère un nombre avec distribution gaussienne (normale)
 * Utilise la transformation de Box-Muller
 */
function generateGaussian(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * stdDev + mean;
}

/**
 * Génère un nombre avec distribution exponentielle
 * Utilise la méthode de transformation inverse
 */
function generateExponential(lambda: number): number {
  return -Math.log(1 - Math.random()) / lambda;
}

/**
 * Génère un nombre avec distribution de Poisson
 * Utilise l'algorithme de Knuth
 */
function generatePoisson(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

/**
 * Génère un nombre avec la distribution spécifiée, contraint dans [min, max]
 * Pour les distributions non uniformes, essaie jusqu'à 100 fois de générer dans la plage,
 * puis clamp en fallback
 */
function generateWithDistribution(
  distribution: DistributionType,
  min: number,
  max: number,
  params?: { mean?: number; stdDev?: number; lambda?: number }
): number {
  if (distribution === 'random') {
    return faker.number.int({ min, max });
  }

  let value: number;
  let attempts = 0;
  const maxAttempts = 100;

  switch (distribution) {
    case 'gaussian':
      const mean = params?.mean ?? (min + max) / 2;
      const stdDev = params?.stdDev ?? (max - min) / 6; // ~99.7% dans [min, max]
      
      do {
        value = generateGaussian(mean, stdDev);
        attempts++;
      } while ((value < min || value > max) && attempts < maxAttempts);
      
      // Fallback: clamp si pas dans la plage
      return Math.max(min, Math.min(max, Math.round(value)));

    case 'exponential':
      const lambdaExp = params?.lambda ?? 1;
      
      do {
        value = min + generateExponential(lambdaExp) * (max - min) / 5;
        attempts++;
      } while ((value < min || value > max) && attempts < maxAttempts);
      
      return Math.max(min, Math.min(max, Math.round(value)));

    case 'poisson':
      const lambdaPois = params?.lambda ?? (min + max) / 2;
      
      do {
        value = generatePoisson(lambdaPois);
        attempts++;
      } while ((value < min || value > max) && attempts < maxAttempts);
      
      return Math.max(min, Math.min(max, Math.round(value)));

    default:
      return faker.number.int({ min, max });
  }
}

/**
 * Formate une taille en octets selon l'unité spécifiée
 */
function formatSize(bytes: number, unit: 'bytes' | 'kb' | 'mb' | 'gb'): string {
  const units = {
    bytes: 1,
    kb: 1024,
    mb: 1024 ** 2,
    gb: 1024 ** 3,
  };
  
  const value = bytes / units[unit];
  return `${value.toFixed(2)} ${unit.toUpperCase()}`;
}

/**
 * Formate une date selon le format spécifié
 */
function formatDate(date: Date, format: DateFormat): string | number {
  switch (format) {
    case 'iso':
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    case 'fr':
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`; // DD/MM/YYYY
    case 'us':
      const dayUS = String(date.getDate()).padStart(2, '0');
      const monthUS = String(date.getMonth() + 1).padStart(2, '0');
      const yearUS = date.getFullYear();
      return `${monthUS}/${dayUS}/${yearUS}`; // MM/DD/YYYY
    case 'timestamp':
      return date.getTime(); // Unix timestamp en millisecondes
    default:
      return date.toISOString().split('T')[0];
  }
}

/**
 * Génère une valeur aléatoire selon le type de champ
 */
function generateFieldValue(field: Field, dateFormat: DateFormat): string | number | boolean {
  switch (field.type) {
    case 'text':
      return faker.lorem.words(3);
    case 'number':
      const min = field.constraints?.numberMin ?? 0;
      const max = field.constraints?.numberMax ?? 10000;
      const distribution = field.constraints?.distribution ?? 'random';
      const params = field.constraints?.distributionParams;
      return generateWithDistribution(distribution, min, max, params);
    case 'date':
      let fromDate: Date;
      let toDate: Date;

      if (field.constraints?.dateMin) {
        fromDate = new Date(field.constraints.dateMin);
      } else {
        // Par défaut: il y a 5 ans
        fromDate = new Date();
        fromDate.setFullYear(fromDate.getFullYear() - 5);
      }

      if (field.constraints?.dateMax) {
        toDate = new Date(field.constraints.dateMax);
      } else {
        // Par défaut: aujourd'hui
        toDate = new Date();
      }

      const randomDate = faker.date.between({ from: fromDate, to: toDate });
      return formatDate(randomDate, dateFormat);
    case 'boolean':
      return faker.datatype.boolean();
    case 'email':
      return faker.internet.email();
    case 'firstName':
      return faker.person.firstName();
    case 'lastName':
      return faker.person.lastName();
    case 'uuid':
      return faker.string.uuid();
    case 'sentence':
      return faker.lorem.sentence();
    case 'taille':
      const lengthMin = field.constraints?.lengthMin ?? 1;
      const lengthMax = field.constraints?.lengthMax ?? 100;
      const lengthUnit = field.constraints?.lengthUnit ?? 'mb';
      const lengthDistribution = field.constraints?.distribution ?? 'random';
      const lengthParams = field.constraints?.distributionParams;
      
      // Génère une taille en unités de base, puis convertit
      const sizeValue = generateWithDistribution(lengthDistribution, lengthMin, lengthMax, lengthParams);
      const units = { bytes: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3 };
      const bytes = sizeValue * units[lengthUnit];
      return formatSize(bytes, lengthUnit);
    case 'ipv4':
      return faker.internet.ipv4();
    case 'ipv6':
      return faker.internet.ipv6();
    default:
      return '';
  }
}

/**
 * Génère un tableau de données selon la configuration
 */
export function generateData(
  fields: Field[],
  rowCount: number,
  dateFormat: DateFormat = 'iso'
): GeneratedRow[] {
  const data: GeneratedRow[] = [];

  for (let i = 0; i < rowCount; i++) {
    const row: GeneratedRow = {};
    
    fields.forEach((field) => {
      row[field.name] = generateFieldValue(field, dateFormat);
    });
    
    data.push(row);
  }

  return data;
}
