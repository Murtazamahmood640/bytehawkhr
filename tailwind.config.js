/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A5F',
        accent:  '#3B82F6',
        success: '#10B981',
        warning: '#F59E0B',
        danger:  '#EF4444',
        surface: '#F8FAFC',
        card:    '#FFFFFF',
        muted:   '#64748B',
      },
      boxShadow: {
        card:   '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.05)',
        lg:     '0 10px 40px -10px rgba(0,0,0,0.15)',
        glow:   '0 0 20px rgba(59,130,246,0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
