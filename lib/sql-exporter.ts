import type { GeneratedRow } from '@/types';

/**
 * Échappe les valeurs pour SQL en gérant les guillemets simples
 */
function escapeSQLValue(value: string | number | boolean): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  
  // Échapper les guillemets simples dans les chaînes
  const escaped = String(value).replace(/'/g, "''");
  return `'${escaped}'`;
}

/**
 * Génère une instruction INSERT INTO pour une ligne de données
 */
function generateInsertStatement(tableName: string, row: GeneratedRow, columns: string[]): string {
  const values = columns.map(col => escapeSQLValue(row[col])).join(', ');
  return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values});`;
}

/**
 * Exporte les données générées en fichier SQL et déclenche le téléchargement
 */
export function exportToSQL(
  data: GeneratedRow[], 
  tableName: string = 'mock_data',
  filename: string = 'data.sql'
): void {
  if (data.length === 0) {
    console.warn('Aucune donnée à exporter');
    return;
  }

  // Extraire les noms de colonnes du premier élément
  const columns = Object.keys(data[0]);

  // Générer le script SQL
  let sql = `-- Script SQL généré par TsMock\n`;
  sql += `-- Table: ${tableName}\n`;
  sql += `-- Lignes: ${data.length}\n\n`;

  // Ajouter les instructions INSERT
  data.forEach((row) => {
    sql += generateInsertStatement(tableName, row, columns) + '\n';
  });

  // Créer un Blob avec le contenu SQL
  const blob = new Blob([sql], { type: 'application/sql;charset=utf-8;' });
  
  // Créer un lien temporaire pour le téléchargement
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Ajouter au DOM, cliquer, puis nettoyer
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Libérer l'URL temporaire
  URL.revokeObjectURL(url);
}
