import Papa from 'papaparse';
import type { GeneratedRow } from '@/types';

/**
 * Exporte les données générées en fichier CSV et déclenche le téléchargement
 */
export function exportToCSV(data: GeneratedRow[], filename: string = 'data.csv'): void {
  if (data.length === 0) {
    console.warn('Aucune donnée à exporter');
    return;
  }

  // Convertir les données en CSV avec Papaparse
  const csv = Papa.unparse(data, {
    quotes: true, // Entourer les valeurs avec des guillemets si nécessaire
    delimiter: ',',
    header: true,
    newline: '\n',
  });

  // Créer un Blob avec le contenu CSV
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
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
