import { faker } from '@faker-js/faker';
import type { Field, DateFormat, GeneratedRow } from '@/types';

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
      return faker.number.int({ min, max });
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
