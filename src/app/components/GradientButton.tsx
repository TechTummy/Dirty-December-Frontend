interface GradientButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
  disabled?: boolean;
}

export function GradientButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  disabled = false
}: GradientButtonProps) {
  if (variant === 'secondary') {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full py-4 px-6 rounded-xl border-2 border-slate-300 bg-white text-gray-900 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:border-slate-400 ${className}`}
      >
        <span className="font-semibold">{children}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-purple-500/40 ${className}`}
    >
      <span className="font-semibold">{children}</span>
    </button>
  );
}