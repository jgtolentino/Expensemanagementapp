/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'scout-primary': '#2563eb',
        'scout-secondary': '#64748b',
        'scout-accent': '#f59e0b',
        'scout-success': '#10b981',
        'scout-warning': '#f59e0b',
        'scout-error': '#ef4444',
      },
    },
  },
  plugins: [],
}