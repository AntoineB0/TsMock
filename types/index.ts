export type DataType = 'text' | 'number' | 'date' | 'boolean';

export type DateFormat = 'iso' | 'fr' | 'us' | 'timestamp';

export interface FieldConstraints {
  // Pour les nombres
  numberMin?: number;
  numberMax?: number;
  // Pour les dates
  dateMin?: string; // Format ISO: YYYY-MM-DD
  dateMax?: string; // Format ISO: YYYY-MM-DD
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
