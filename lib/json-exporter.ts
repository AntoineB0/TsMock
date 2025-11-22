import type { GeneratedRow } from '@/types';

/**
 * Exporte les données générées en fichier JSON et déclenche le téléchargement
 */
export function exportToJSON(data: GeneratedRow[], filename: string = 'data.json'): void {
  if (data.length === 0) {
    console.warn('Aucune donnée à exporter');
    return;
  }

  // Convertir les données en JSON formaté
  const json = JSON.stringify(data, null, 2);

  // Créer un Blob avec le contenu JSON
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  
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
