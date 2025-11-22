'use client';

import { useState } from 'react';
import type { Field, DataType, DateFormat } from '@/types';
import FieldItem from './FieldItem';
import { generateData } from '@/lib/generator';
import { exportToCSV } from '@/lib/csv-exporter';

export default function FieldManager() {
  const [fields, setFields] = useState<Field[]>([]);
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<DataType>('text');
  const [rowCount, setRowCount] = useState(100);
  const [dateFormat, setDateFormat] = useState<DateFormat>('iso');
  
  // États pour les contraintes
  const [numberMin, setNumberMin] = useState<string>('0');
  const [numberMax, setNumberMax] = useState<string>('10000');
  const [dateMin, setDateMin] = useState<string>('');
  const [dateMax, setDateMax] = useState<string>('');
  
  // État pour l'édition
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  // Vérifie si au moins un champ de type date existe
  const hasDateField = fields.some((field) => field.type === 'date');

  const addField = () => {
    if (!fieldName.trim()) {
      alert('Veuillez entrer un nom de champ');
      return;
    }

    // Vérifier les doublons (sauf si on édite le même champ)
    if (fields.some((f) => f.name === fieldName.trim() && f.id !== editingFieldId)) {
      alert('Un champ avec ce nom existe déjà');
      return;
    }

    const constraints: Field['constraints'] = {};

    // Ajouter les contraintes pour les nombres
    if (fieldType === 'number') {
      const min = parseInt(numberMin) || 0;
      const max = parseInt(numberMax) || 10000;
      if (min > max) {
        alert('La valeur minimum ne peut pas être supérieure à la valeur maximum');
        return;
      }
      constraints.numberMin = min;
      constraints.numberMax = max;
    }

    // Ajouter les contraintes pour les dates
    if (fieldType === 'date') {
      if (dateMin) constraints.dateMin = dateMin;
      if (dateMax) constraints.dateMax = dateMax;
      
      if (dateMin && dateMax && new Date(dateMin) > new Date(dateMax)) {
        alert('La date minimum ne peut pas être postérieure à la date maximum');
        return;
      }
    }

    if (editingFieldId) {
      // Mode édition
      setFields(fields.map((f) => 
        f.id === editingFieldId 
          ? { ...f, name: fieldName.trim(), type: fieldType, constraints }
          : f
      ));
      setEditingFieldId(null);
    } else {
      // Mode ajout
      const newField: Field = {
        id: crypto.randomUUID(),
        name: fieldName.trim(),
        type: fieldType,
        constraints: Object.keys(constraints).length > 0 ? constraints : undefined,
      };
      setFields([...fields, newField]);
    }

    // Réinitialiser le formulaire
    setFieldName('');
    setFieldType('text');
    setNumberMin('0');
    setNumberMax('10000');
    setDateMin('');
    setDateMax('');
  };

  const editField = (id: string) => {
    const field = fields.find((f) => f.id === id);
    if (!field) return;

    setEditingFieldId(id);
    setFieldName(field.name);
    setFieldType(field.type);
    
    if (field.type === 'number' && field.constraints) {
      setNumberMin(String(field.constraints.numberMin ?? 0));
      setNumberMax(String(field.constraints.numberMax ?? 10000));
    }
    
    if (field.type === 'date' && field.constraints) {
      setDateMin(field.constraints.dateMin || '');
      setDateMax(field.constraints.dateMax || '');
    }
  };

  const cancelEdit = () => {
    setEditingFieldId(null);
    setFieldName('');
    setFieldType('text');
    setNumberMin('0');
    setNumberMax('10000');
    setDateMin('');
    setDateMax('');
  };

  const deleteField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const handleGenerate = () => {
    if (fields.length === 0) {
      alert('Veuillez ajouter au moins un champ');
      return;
    }

    if (rowCount < 1) {
      alert('Le nombre de lignes doit être supérieur à 0');
      return;
    }

    // Générer les données
    const data = generateData(fields, rowCount, dateFormat);
    
    // Exporter en CSV
    exportToCSV(data, 'mock-data.csv');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-dusk-blue-900">Générateur de Données Mock</h1>
        <p className="mt-2 text-dusk-blue-700">Créez rapidement des jeux de données CSV pour vos tests</p>
      </div>

      {/* Formulaire d'ajout de champ */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-dusk-blue-200">
        <h2 className="text-xl font-semibold text-dusk-blue-900 mb-4">
          {editingFieldId ? 'Modifier un champ' : 'Ajouter un champ'}
        </h2>
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addField()}
              placeholder="Nom du champ"
              className="flex-1 px-4 py-2 border border-dusk-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-500 bg-white text-dusk-blue-900"
            />
            <select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value as DataType)}
              className="px-4 py-2 border border-dusk-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-500 bg-white text-dusk-blue-900"
            >
              <option value="text">Texte</option>
              <option value="number">Nombre</option>
              <option value="date">Date</option>
              <option value="boolean">Booléen</option>
            </select>
          </div>

          {/* Contraintes pour les nombres */}
          {fieldType === 'number' && (
            <div className="flex gap-3 items-center">
              <label className="text-sm font-medium text-dusk-blue-800">Intervalle:</label>
              <input
                type="number"
                value={numberMin}
                onChange={(e) => setNumberMin(e.target.value)}
                placeholder="Min"
                className="flex-1 px-4 py-2 border border-dusk-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-500 bg-white text-dusk-blue-900"
              />
              <span className="text-dusk-blue-600">à</span>
              <input
                type="number"
                value={numberMax}
                onChange={(e) => setNumberMax(e.target.value)}
                placeholder="Max"
                className="flex-1 px-4 py-2 border border-dusk-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-500 bg-white text-dusk-blue-900"
              />
            </div>
          )}

          {/* Contraintes pour les dates */}
          {fieldType === 'date' && (
            <div className="flex gap-3 items-center">
              <label className="text-sm font-medium text-dusk-blue-800">Période:</label>
              <input
                type="date"
                value={dateMin}
                onChange={(e) => setDateMin(e.target.value)}
                placeholder="Date min"
                className="flex-1 px-4 py-2 border border-dusk-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-500 bg-white text-dusk-blue-900"
              />
              <span className="text-dusk-blue-600">à</span>
              <input
                type="date"
                value={dateMax}
                onChange={(e) => setDateMax(e.target.value)}
                placeholder="Date max"
                className="flex-1 px-4 py-2 border border-dusk-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-500 bg-white text-dusk-blue-900"
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={addField}
              className="flex-1 px-6 py-2 bg-dark-amethyst-600 text-white font-medium rounded-lg hover:bg-dark-amethyst-700 transition-colors"
            >
              {editingFieldId ? 'Mettre à jour' : 'Ajouter'}
            </button>
            {editingFieldId && (
              <button
                onClick={cancelEdit}
                className="px-6 py-2 bg-dusk-blue-200 text-dusk-blue-800 font-medium rounded-lg hover:bg-dusk-blue-300 transition-colors"
              >
                Annuler
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Liste des champs */}
      {fields.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-dusk-blue-200">
          <h2 className="text-xl font-semibold text-dusk-blue-900 mb-4">
            Champs configurés ({fields.length})
          </h2>
          <div className="space-y-2">
            {fields.map((field) => (
              <FieldItem key={field.id} field={field} onDelete={deleteField} onEdit={editField} />
            ))}
          </div>
        </div>
      )}

      {/* Configuration de la génération */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-dusk-blue-200">
        <h2 className="text-xl font-semibold text-dusk-blue-900 mb-4">Configuration de la génération</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="rowCount" className="block text-sm font-medium text-dusk-blue-800 mb-2">
              Nombre de lignes à générer
            </label>
            <input
              id="rowCount"
              type="number"
              value={rowCount}
              onChange={(e) => setRowCount(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="w-full px-4 py-2 border border-dusk-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-500 bg-white text-dusk-blue-900"
            />
          </div>

          {hasDateField && (
            <div>
              <label htmlFor="dateFormat" className="block text-sm font-medium text-dusk-blue-800 mb-2">
                Format des dates
              </label>
              <select
                id="dateFormat"
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value as DateFormat)}
                className="w-full px-4 py-2 border border-dusk-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-500 bg-white text-dusk-blue-900"
              >
                <option value="iso">ISO 8601 (YYYY-MM-DD)</option>
                <option value="fr">Format français (DD/MM/YYYY)</option>
                <option value="us">Format américain (MM/DD/YYYY)</option>
                <option value="timestamp">Timestamp Unix</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Bouton de génération */}
      <div className="flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={fields.length === 0}
          className="px-8 py-3 bg-lime-cream-600 text-white font-semibold rounded-lg hover:bg-lime-cream-700 disabled:bg-dusk-blue-300 disabled:cursor-not-allowed transition-colors text-lg shadow-lg"
        >
          Générer et télécharger le CSV
        </button>
      </div>
    </div>
  );
}
