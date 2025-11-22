'use client';

import { useState, useEffect } from 'react';
import type { Field, DataType, DateFormat, ExportFormat, DistributionType, GeneratedRow } from '@/types';
import FieldItem from './FieldItem';
import { generateData } from '@/lib/generator';
import { exportToCSV } from '@/lib/csv-exporter';
import { exportToJSON } from '@/lib/json-exporter';
import { exportToSQL } from '@/lib/sql-exporter';

export default function FieldManager() {
  const [fields, setFields] = useState<Field[]>([]);
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<DataType>('text');
  const [rowCount, setRowCount] = useState(100);
  const [dateFormat, setDateFormat] = useState<DateFormat>('iso');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [tableName, setTableName] = useState('mock_data');
  
  // États pour les contraintes de base
  const [numberMin, setNumberMin] = useState<string>('0');
  const [numberMax, setNumberMax] = useState<string>('10000');
  const [dateMin, setDateMin] = useState<string>('');
  const [dateMax, setDateMax] = useState<string>('');
  
  // États pour les distributions (MVP 3)
  const [distribution, setDistribution] = useState<DistributionType>('random');
  const [distributionMean, setDistributionMean] = useState<string>('');
  const [distributionStdDev, setDistributionStdDev] = useState<string>('');
  const [distributionLambda, setDistributionLambda] = useState<string>('');
  
  // États pour le type taille (MVP 3)
  const [lengthMin, setLengthMin] = useState<string>('1');
  const [lengthMax, setLengthMax] = useState<string>('100');
  const [lengthUnit, setLengthUnit] = useState<'bytes' | 'kb' | 'mb' | 'gb'>('mb');
  
  // État pour l'aperçu temps réel (MVP 3)
  const [previewData, setPreviewData] = useState<GeneratedRow[]>([]);
  
  // État pour l'édition
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  // Vérifie si au moins un champ de type date existe
  const hasDateField = fields.some((field) => field.type === 'date');

  // Génère l'aperçu automatiquement avec debounce (MVP 3)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fields.length > 0) {
        try {
          const preview = generateData(fields, 5, dateFormat);
          setPreviewData(preview);
        } catch (error) {
          console.error('Erreur lors de la génération de l\'aperçu:', error);
          setPreviewData([]);
        }
      } else {
        setPreviewData([]);
      }
    }, 300); // Debounce de 300ms
    
    return () => clearTimeout(timer);
  }, [fields, dateFormat]);

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
      
      // Ajouter les paramètres de distribution (MVP 3)
      if (distribution !== 'random') {
        constraints.distribution = distribution;
        constraints.distributionParams = {};
        
        if (distribution === 'gaussian') {
          const mean = parseFloat(distributionMean);
          const stdDev = parseFloat(distributionStdDev);
          
          if (distributionMean && isNaN(mean)) {
            alert('La moyenne doit être un nombre valide');
            return;
          }
          if (distributionStdDev && (isNaN(stdDev) || stdDev <= 0)) {
            alert('L\'écart-type doit être un nombre positif');
            return;
          }
          
          if (distributionMean) constraints.distributionParams.mean = mean;
          if (distributionStdDev) constraints.distributionParams.stdDev = stdDev;
        }
        
        if (distribution === 'exponential' || distribution === 'poisson') {
          const lambda = parseFloat(distributionLambda);
          
          if (!distributionLambda || isNaN(lambda) || lambda <= 0) {
            alert('Lambda (λ) doit être un nombre positif pour la distribution ' + distribution);
            return;
          }
          
          constraints.distributionParams.lambda = lambda;
        }
      }
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
    
    // Ajouter les contraintes pour le type taille (MVP 3)
    if (fieldType === 'taille') {
      const min = parseInt(lengthMin);
      const max = parseInt(lengthMax);
      
      if (isNaN(min) || isNaN(max) || min < 0 || max < 0) {
        alert('Les valeurs de taille doivent être des nombres positifs');
        return;
      }
      if (min > max) {
        alert('La taille minimum ne peut pas être supérieure à la taille maximum');
        return;
      }
      
      constraints.lengthMin = min;
      constraints.lengthMax = max;
      constraints.lengthUnit = lengthUnit;
      
      // Ajouter les paramètres de distribution pour taille
      if (distribution !== 'random') {
        constraints.distribution = distribution;
        constraints.distributionParams = {};
        
        if (distribution === 'gaussian') {
          const mean = parseFloat(distributionMean);
          const stdDev = parseFloat(distributionStdDev);
          
          if (distributionMean && isNaN(mean)) {
            alert('La moyenne doit être un nombre valide');
            return;
          }
          if (distributionStdDev && (isNaN(stdDev) || stdDev <= 0)) {
            alert('L\'écart-type doit être un nombre positif');
            return;
          }
          
          if (distributionMean) constraints.distributionParams.mean = mean;
          if (distributionStdDev) constraints.distributionParams.stdDev = stdDev;
        }
        
        if (distribution === 'exponential' || distribution === 'poisson') {
          const lambda = parseFloat(distributionLambda);
          
          if (!distributionLambda || isNaN(lambda) || lambda <= 0) {
            alert('Lambda (λ) doit être un nombre positif pour la distribution ' + distribution);
            return;
          }
          
          constraints.distributionParams.lambda = lambda;
        }
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
    setDistribution('random');
    setDistributionMean('');
    setDistributionStdDev('');
    setDistributionLambda('');
    setLengthMin('1');
    setLengthMax('100');
    setLengthUnit('mb');
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
      setDistribution(field.constraints.distribution ?? 'random');
      
      if (field.constraints.distributionParams) {
        setDistributionMean(String(field.constraints.distributionParams.mean ?? ''));
        setDistributionStdDev(String(field.constraints.distributionParams.stdDev ?? ''));
        setDistributionLambda(String(field.constraints.distributionParams.lambda ?? ''));
      }
    }
    
    if (field.type === 'date' && field.constraints) {
      setDateMin(field.constraints.dateMin || '');
      setDateMax(field.constraints.dateMax || '');
    }
    
    if (field.type === 'taille' && field.constraints) {
      setLengthMin(String(field.constraints.lengthMin ?? 1));
      setLengthMax(String(field.constraints.lengthMax ?? 100));
      setLengthUnit(field.constraints.lengthUnit ?? 'mb');
      setDistribution(field.constraints.distribution ?? 'random');
      
      if (field.constraints.distributionParams) {
        setDistributionMean(String(field.constraints.distributionParams.mean ?? ''));
        setDistributionStdDev(String(field.constraints.distributionParams.stdDev ?? ''));
        setDistributionLambda(String(field.constraints.distributionParams.lambda ?? ''));
      }
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
    setDistribution('random');
    setDistributionMean('');
    setDistributionStdDev('');
    setDistributionLambda('');
    setLengthMin('1');
    setLengthMax('100');
    setLengthUnit('mb');
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

    if (exportFormat === 'sql' && !tableName.trim()) {
      alert('Veuillez entrer un nom de table pour l\'export SQL');
      return;
    }

    // Générer les données
    const data = generateData(fields, rowCount, dateFormat);
    
    // Exporter selon le format choisi
    switch (exportFormat) {
      case 'csv':
        exportToCSV(data, 'mock-data.csv');
        break;
      case 'json':
        exportToJSON(data, 'mock-data.json');
        break;
      case 'sql':
        exportToSQL(data, tableName.trim(), 'mock-data.sql');
        break;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-dusk-blue-900">Générateur de Données Mock</h1>
        <p className="mt-2 text-dusk-blue-700">Créez rapidement des jeux de données CSV, JSON ou SQL pour vos tests</p>
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
              <option value="email">Email</option>
              <option value="firstName">Prénom</option>
              <option value="lastName">Nom</option>
              <option value="uuid">UUID</option>
              <option value="sentence">Phrase</option>
              <option value="taille">Taille</option>
              <option value="ipv4">IPv4</option>
              <option value="ipv6">IPv6</option>
            </select>
          </div>

          {/* Contraintes pour les nombres */}
          {fieldType === 'number' && (
            <div className="space-y-3">
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
              
              {/* Sélecteur de distribution */}
              <div className="flex gap-3 items-center">
                <label className="text-sm font-medium text-dusk-blue-800">Distribution:</label>
                <select
                  value={distribution}
                  onChange={(e) => setDistribution(e.target.value as DistributionType)}
                  className="flex-1 px-4 py-2 border border-dusk-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-500 bg-white text-dusk-blue-900"
                >
                  <option value="random">Aléatoire (uniforme)</option>
                  <option value="gaussian">Gaussienne (normale)</option>
                  <option value="exponential">Exponentielle</option>
                  <option value="poisson">Poisson</option>
                </select>
              </div>
              
              {/* Paramètres pour distribution gaussienne */}
              {distribution === 'gaussian' && (
                <div className="flex gap-3 items-center pl-4 border-l-2 border-dark-amethyst-300">
                  <label className="text-sm font-medium text-dusk-blue-800">Paramètres:</label>
                  <input
                    type="number"
                    step="any"
                    value={distributionMean}
                    onChange={(e) => setDistributionMean(e.target.value)}
                    placeholder="Moyenne (μ)"
                    className="flex-1 px-4 py-2 border border-dusk-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-500 bg-white text-dusk-blue-900"
                  />
                  <input
                    type="number"
                    step="any"
                    value={distributionStdDev}
                    onChange={(e) => setDistributionStdDev(e.target.value)}
                    placeholder="Écart-type (σ)"
                    className="flex-1 px-4 py-2 border border-dusk-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-500 bg-white text-dusk-blue-900"
                  />
                </div>
              )}
              
              {/* Paramètres pour distributions exponentielles et Poisson */}
              {(distribution === 'exponential' || distribution === 'poisson') && (
                <div className="flex gap-3 items-center pl-4 border-l-2 border-dark-amethyst-300">
                  <label className="text-sm font-medium text-dusk-blue-800">Paramètre:</label>
                  <input
                    type="number"
                    step="any"
                    value={distributionLambda}
                    onChange={(e) => setDistributionLambda(e.target.value)}
                    placeholder="Lambda (λ)"
                    className="flex-1 px-4 py-2 border border-dusk-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-500 bg-white text-dusk-blue-900"
                  />
                </div>
              )}
            </div>
          )}

          {/* Contraintes pour le type taille */}
          {fieldType === 'taille' && (
            <div className="space-y-3">
              <div className="flex gap-3 items-center">
                <label className="text-sm font-medium text-dusk-blue-800">Intervalle:</label>
                <input
                  type="number"
                  value={lengthMin}
                  onChange={(e) => setLengthMin(e.target.value)}
                  placeholder="Min"
                  className="flex-1 px-4 py-2 border border-dusk-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-500 bg-white text-dusk-blue-900"
                />
                <span className="text-dusk-blue-600">à</span>
                <input
                  type="number"
                  value={lengthMax}
                  onChange={(e) => setLengthMax(e.target.value)}
                  placeholder="Max"
                  className="flex-1 px-4 py-2 border border-dusk-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-500 bg-white text-dusk-blue-900"
                />
                <select
                  value={lengthUnit}
                  onChange={(e) => setLengthUnit(e.target.value as 'bytes' | 'kb' | 'mb' | 'gb')}
                  className="px-4 py-2 border border-dusk-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-500 bg-white text-dusk-blue-900"
                >
                  <option value="bytes">Bytes</option>
                  <option value="kb">KB</option>
                  <option value="mb">MB</option>
                  <option value="gb">GB</option>
                </select>
              </div>
              
              {/* Sélecteur de distribution pour taille */}
              <div className="flex gap-3 items-center">
                <label className="text-sm font-medium text-dusk-blue-800">Distribution:</label>
                <select
                  value={distribution}
                  onChange={(e) => setDistribution(e.target.value as DistributionType)}
                  className="flex-1 px-4 py-2 border border-dusk-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-500 bg-white text-dusk-blue-900"
                >
                  <option value="random">Aléatoire (uniforme)</option>
                  <option value="gaussian">Gaussienne (normale)</option>
                  <option value="exponential">Exponentielle</option>
                  <option value="poisson">Poisson</option>
                </select>
              </div>
              
              {/* Paramètres pour distribution gaussienne */}
              {distribution === 'gaussian' && (
                <div className="flex gap-3 items-center pl-4 border-l-2 border-dark-amethyst-300">
                  <label className="text-sm font-medium text-dusk-blue-800">Paramètres:</label>
                  <input
                    type="number"
                    step="any"
                    value={distributionMean}
                    onChange={(e) => setDistributionMean(e.target.value)}
                    placeholder="Moyenne (μ)"
                    className="flex-1 px-4 py-2 border border-dusk-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-500 bg-white text-dusk-blue-900"
                  />
                  <input
                    type="number"
                    step="any"
                    value={distributionStdDev}
                    onChange={(e) => setDistributionStdDev(e.target.value)}
                    placeholder="Écart-type (σ)"
                    className="flex-1 px-4 py-2 border border-dusk-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-500 bg-white text-dusk-blue-900"
                  />
                </div>
              )}
              
              {/* Paramètres pour distributions exponentielles et Poisson */}
              {(distribution === 'exponential' || distribution === 'poisson') && (
                <div className="flex gap-3 items-center pl-4 border-l-2 border-dark-amethyst-300">
                  <label className="text-sm font-medium text-dusk-blue-800">Paramètre:</label>
                  <input
                    type="number"
                    step="any"
                    value={distributionLambda}
                    onChange={(e) => setDistributionLambda(e.target.value)}
                    placeholder="Lambda (λ)"
                    className="flex-1 px-4 py-2 border border-dusk-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-500 bg-white text-dusk-blue-900"
                  />
                </div>
              )}
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

      {/* Aperçu temps réel (MVP 3) */}
      {previewData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-dusk-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-dusk-blue-900">
              Aperçu des données (5 lignes)
            </h2>
            <button
              onClick={() => {
                const preview = generateData(fields, 5, dateFormat);
                setPreviewData(preview);
              }}
              className="text-sm px-3 py-1 text-dark-amethyst-700 hover:text-dark-amethyst-900 hover:bg-dark-amethyst-50 rounded transition-colors"
              title="Actualiser l'aperçu"
            >
              🔄 Actualiser
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-deep-space-blue-100">
                  {fields.map((field) => (
                    <th
                      key={field.id}
                      className="px-4 py-2 text-left text-sm font-medium text-dusk-blue-900 border border-dusk-blue-200"
                    >
                      {field.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-deep-space-blue-50 transition-colors">
                    {fields.map((field) => (
                      <td
                        key={field.id}
                        className="px-4 py-2 text-sm text-dusk-blue-800 border border-dusk-blue-200"
                      >
                        {String(row[field.name])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
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

          <div>
            <label htmlFor="exportFormat" className="block text-sm font-medium text-dusk-blue-800 mb-2">
              Format d&apos;export
            </label>
            <select
              id="exportFormat"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
              className="w-full px-4 py-2 border border-dusk-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-500 bg-white text-dusk-blue-900"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="sql">SQL</option>
            </select>
          </div>

          {exportFormat === 'sql' && (
            <div>
              <label htmlFor="tableName" className="block text-sm font-medium text-dusk-blue-800 mb-2">
                Nom de la table SQL
              </label>
              <input
                id="tableName"
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="mock_data"
                className="w-full px-4 py-2 border border-dusk-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-500 bg-white text-dusk-blue-900"
              />
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
          Générer et télécharger {exportFormat.toUpperCase()}
        </button>
      </div>
    </div>
  );
}
