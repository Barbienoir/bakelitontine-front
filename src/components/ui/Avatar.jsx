export function Avatar({ name = '', photo, size = 'md' }) {
  const s = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <div className={`${s} rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0`}>
      {photo
        ? <img src={photo} alt={name} className="w-full h-full object-cover" />
        : <span className="font-semibold text-primary">{initials}</span>
      }
    </div>
  );
}
 
export function ProgressBar({ value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{value}%</span>
    </div>
  );
}
 
export function StatutBadge({ statut }) {
  const styles = {
    'En cours': 'bg-green-50 text-green-700',
    'Bloqué':   'bg-red-50 text-red-700',
    'Terminé':  'bg-blue-50 text-blue-700',
    'Archivé':  'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`badge-status ${styles[statut] || 'bg-gray-100 text-gray-600'}`}>
      {statut}
    </span>
  );
}
 
const EmptyChart = () => (
  <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
    Aucune donnée disponible
  </div>
);
 
const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-gray-200 rounded-lg w-48" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card h-20 bg-gray-100" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="card lg:col-span-2 h-64 bg-gray-100" />
      <div className="card h-64 bg-gray-100" />
    </div>
  </div>
);
 