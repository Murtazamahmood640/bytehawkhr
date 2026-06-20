import { Loader2 } from 'lucide-react';

export default function Button({ children, variant = 'primary', loading, className = '', ...props }) {
  const variants = {
    primary:   'btn-primary',
    secondary: 'btn-secondary',
    danger:    'btn-danger',
    ghost:     'btn-ghost',
  };
  return (
    <button className={`btn ${variants[variant] || variants.primary} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
