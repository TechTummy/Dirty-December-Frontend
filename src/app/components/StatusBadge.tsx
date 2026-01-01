interface StatusBadgeProps {
  status: 'confirmed' | 'pending' | 'locked' | 'unlocked';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const configs = {
    confirmed: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      label: 'Confirmed'
    },
    pending: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      label: 'Pending'
    },
    locked: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      border: 'border-gray-200',
      label: 'Locked'
    },
    unlocked: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      label: 'Unlocked'
    }
  };

  const config = configs[status];
  const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} font-medium`}>
      {config.label}
    </span>
  );
}
