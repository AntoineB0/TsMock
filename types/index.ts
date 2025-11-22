export type DataType = 'text' | 'number' | 'date' | 'boolean' | 'email' | 'firstName' | 'lastName' | 'uuid' | 'sentence' | 'taille' | 'ipv4' | 'ipv6';

export type DateFormat = 'iso' | 'fr' | 'us' | 'timestamp';

export type ExportFormat = 'csv' | 'json' | 'sql';

export type DistributionType = 'random' | 'gaussian' | 'exponential' | 'poisson';

export interface DistributionParams {
  mean?: number;        // Pour gaussienne
  stdDev?: number;      // Pour gaussienne
  lambda?: number;      // Pour exponentielle et poisson
}

export interface FieldConstraints {
  // Pour les nombres
  numberMin?: number;
  numberMax?: number;
  // Pour les dates
  dateMin?: string; // Format ISO: YYYY-MM-DD
  dateMax?: string; // Format ISO: YYYY-MM-DD
  // Pour les distributions (nombres et taille)
  distribution?: DistributionType;
  distributionParams?: DistributionParams;
  // Pour le type taille
  lengthMin?: number;
  lengthMax?: number;
  lengthUnit?: 'bytes' | 'kb' | 'mb' | 'gb';
}

export interface Field {
  id: string;
  name: string;
  type: DataType;
  constraints?: FieldConstraints;
}

export interface GenerationConfig {
  fields: Field[];
  rowCount: number;
  dateFormat: DateFormat;
}

export type GeneratedRow = Record<string, string | number | boolean>;
