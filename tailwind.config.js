/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sadhana: {
          dark: '#131211',       // Cozy charcoal clay
          card: '#1a1917',       // Soft linen charcoal
          cardHover: '#23211f',  // Slightly lighter clay
          border: 'rgba(255, 255, 255, 0.05)',
          gold: {
            light: '#faf8f5',
            DEFAULT: '#e5e0d8',  // Oatmeal cream
            dark: '#a59e92',     // Muted sand
            accent: '#d6a978',   // Soft warm gold
          },
          // Earthy, organic presets (color psychology: calming, hand-crafted)
          saffron: '#cd7f66',   // Terracotta saffron
          crimson: '#b55856',   // Muted madder red
          emerald: '#768a78',   // Calm sage green (completions/done)
          blue: '#728196',      // Slate grey-blue
          purple: '#90788d',    // Muted heather purple
        }
      },
      fontFamily: {
        serif: ['Lora', 'Cinzel', 'Playfair Display', 'serif'],
        sans: ['Inter', 'DM Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
