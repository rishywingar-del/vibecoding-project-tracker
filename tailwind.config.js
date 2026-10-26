/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Tweak in M6 (tag-style) and M8 (due-tint)
        feature: '#10B981', // emerald
        bug: '#DC2626',     // crimson
        'brand-primary': '#1D4ED8',
        'brand-accent': '#2563EB',
        'surface-page': '#F8FAFC',
        'surface-card': '#FFFFFF',
        'text-primary': '#0F172A',
        'text-muted': '#475569',
        'type-feature': '#047857',
        'type-bug': '#B91C1C',
        'due-safe': '#047857',
        'due-warning': '#B45309',
        'due-overdue': '#B91C1C',
        'due-neutral': '#64748B',
      },
    },
  },
  plugins: [],
};