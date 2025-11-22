import type { Field } from '@/types';

interface FieldItemProps {
  field: Field;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const dataTypeLabels: Record<Field['type'], string> = {
  text: 'Texte',
  number: 'Nombre',
  date: 'Date',
  boolean: 'Booléen',
  email: 'Email',
  firstName: 'Prénom',
  lastName: 'Nom',
  uuid: 'UUID',
  sentence: 'Phrase',
  taille: 'Taille',
  ipv4: 'IPv4',
  ipv6: 'IPv6',
};

export default function FieldItem({ field, onDelete, onEdit }: FieldItemProps) {
  const getConstraintText = () => {
    if (field.type === 'number' && field.constraints) {
      const min = field.constraints.numberMin ?? 0;
      const max = field.constraints.numberMax ?? 10000;
      const dist = field.constraints.distribution;
      const distText = dist && dist !== 'random' ? ` (${dist})` : '';
      return `[${min} - ${max}]${distText}`;
    }
    if (field.type === 'date' && field.constraints) {
      const min = field.constraints.dateMin || '5 ans';
      const max = field.constraints.dateMax || "aujourd'hui";
      return `[${min} - ${max}]`;
    }
    if (field.type === 'taille' && field.constraints) {
      const min = field.constraints.lengthMin ?? 1;
      const max = field.constraints.lengthMax ?? 100;
      const unit = field.constraints.lengthUnit ?? 'mb';
      const dist = field.constraints.distribution;
      const distText = dist && dist !== 'random' ? ` (${dist})` : '';
      return `[${min}-${max} ${unit.toUpperCase()}]${distText}`;
    }
    return null;
  };

  return (
    <div className="flex items-center justify-between p-3 bg-deep-space-blue-50 rounded-lg border border-dusk-blue-200">
      <div className="flex items-center gap-3">
        <span className="font-medium text-dusk-blue-900">{field.name}</span>
        <span className="px-2 py-1 text-xs font-medium text-dark-amethyst-700 bg-white rounded border border-dark-amethyst-300">
          {dataTypeLabels[field.type]}
        </span>
        {getConstraintText() && (
          <span className="text-xs text-dusk-blue-600">
            {getConstraintText()}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(field.id)}
          className="px-3 py-1 text-sm text-dark-amethyst-700 hover:text-dark-amethyst-900 hover:bg-dark-amethyst-100 rounded transition-colors"
          aria-label={`Modifier le champ ${field.name}`}
        >
          Modifier
        </button>
        <button
          onClick={() => onDelete(field.id)}
          className="px-3 py-1 text-sm text-muted-teal-700 hover:text-muted-teal-900 hover:bg-muted-teal-100 rounded transition-colors"
          aria-label={`Supprimer le champ ${field.name}`}
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
