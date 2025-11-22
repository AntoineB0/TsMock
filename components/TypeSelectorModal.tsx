import type { DataType } from '@/types';

interface TypeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: DataType) => void;
  currentType: DataType;
}

const dataTypeCategories = {
  basic: {
    name: 'Types de base',
    types: [
      { type: 'text' as DataType, label: 'Texte', description: 'Texte aléatoire court', icon: '📝' },
      { type: 'number' as DataType, label: 'Nombre', description: 'Nombre entier avec contraintes', icon: '🔢' },
      { type: 'date' as DataType, label: 'Date', description: 'Date avec formats multiples', icon: '📅' },
      { type: 'boolean' as DataType, label: 'Booléen', description: 'Vrai ou Faux', icon: '✓' },
    ],
  },
  personal: {
    name: 'Données personnelles',
    types: [
      { type: 'firstName' as DataType, label: 'Prénom', description: 'Prénom aléatoire', icon: '👤' },
      { type: 'lastName' as DataType, label: 'Nom', description: 'Nom de famille', icon: '👥' },
      { type: 'email' as DataType, label: 'Email', description: 'Adresse email', icon: '📧' },
    ],
  },
  technical: {
    name: 'Données techniques',
    types: [
      { type: 'uuid' as DataType, label: 'UUID', description: 'Identifiant unique universel', icon: '🔑' },
      { type: 'ipv4' as DataType, label: 'IPv4', description: 'Adresse IP version 4', icon: '🌐' },
      { type: 'ipv6' as DataType, label: 'IPv6', description: 'Adresse IP version 6', icon: '🌍' },
      { type: 'taille' as DataType, label: 'Taille', description: 'Taille de fichier avec unités', icon: '💾' },
    ],
  },
  content: {
    name: 'Contenu textuel',
    types: [
      { type: 'sentence' as DataType, label: 'Phrase', description: 'Phrase complète aléatoire', icon: '💬' },
    ],
  },
};

export default function TypeSelectorModal({ isOpen, onClose, onSelect, currentType }: TypeSelectorModalProps) {
  if (!isOpen) return null;

  const handleSelect = (type: DataType) => {
    onSelect(type);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-dusk-blue-200 bg-linear-to-r from-deep-space-blue-50 to-dark-amethyst-50">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-dusk-blue-900">Choisir un type de données</h2>
              <button
                onClick={onClose}
                className="text-dusk-blue-600 hover:text-dusk-blue-900 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-dusk-blue-100 transition-colors"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-dusk-blue-700 mt-1">Sélectionnez le type de données pour votre champ</p>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="space-y-8">
              {Object.entries(dataTypeCategories).map(([categoryKey, category]) => (
                <div key={categoryKey}>
                  <h3 className="text-lg font-semibold text-dusk-blue-900 mb-3 flex items-center">
                    {category.name}
                    <span className="ml-2 text-xs font-normal text-dusk-blue-600 bg-dusk-blue-100 px-2 py-1 rounded-full">
                      {category.types.length}
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {category.types.map((typeInfo) => (
                      <button
                        key={typeInfo.type}
                        onClick={() => handleSelect(typeInfo.type)}
                        className={`
                          p-4 rounded-lg border-2 text-left transition-all duration-200
                          hover:scale-105 hover:shadow-md
                          ${currentType === typeInfo.type
                            ? 'border-dark-amethyst-500 bg-dark-amethyst-50 shadow-md'
                            : 'border-dusk-blue-200 bg-white hover:border-dark-amethyst-300 hover:bg-dark-amethyst-50'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-3xl shrink-0">{typeInfo.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-dusk-blue-900">{typeInfo.label}</h4>
                              {currentType === typeInfo.type && (
                                <span className="text-dark-amethyst-600 text-xl">✓</span>
                              )}
                            </div>
                            <p className="text-xs text-dusk-blue-600 line-clamp-2">
                              {typeInfo.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-dusk-blue-200 bg-deep-space-blue-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-dusk-blue-200 text-dusk-blue-900 font-medium rounded-lg hover:bg-dusk-blue-300 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
