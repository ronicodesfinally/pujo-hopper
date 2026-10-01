/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Sada Saree Lal Par palette ──────────────────────────────────
        muslin:  '#FFFCF7',   // warm white — the saree body
        cream:   '#FFF5EB',   // deep cream — card backgrounds
        lal:     '#B5002E',   // deep Bengali crimson — the "lal par"
        lalLight:'#DC143C',   // brighter red — hover/active
        lalPale: '#FFF0F2',   // very pale red — tinted surfaces
        lalDark: '#7A0020',   // dark crimson — pressed states
        zari:    '#C9A84C',   // zari gold — thin accent lines
        zariDark:'#8B6914',   // darker gold
        inkDark: '#1A0505',   // near-black with warmth — primary text
        inkMid:  '#5C2020',   // dark maroon — secondary text
        inkMute: '#9B6060',   // muted rose — placeholder / muted
        inkFaint:'#E8CECE',   // very faint red — borders
        // ── Functional colours (keep these for crowd indicators) ──────────
        crowd: {
          low:    '#16A34A',
          mid:    '#D97706',
          high:   '#EA580C',
          peak:   '#DC2626',
        },
      },
      fontFamily: {
        sans:  ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-noto)', 'Georgia', 'serif'],
      },
      boxShadow: {
        par:  '0 -3px 0 0 #B5002E',       // red top-edge "par" shadow
        card: '0 2px 16px rgba(181,0,46,0.08)',
        lal:  '0 4px 24px rgba(181,0,46,0.20)',
      },
      animation: {
        'fade-up':   'fadeUp 0.25s ease-out',
        'slide-up':  'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-red': 'pulseRed 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:   { '0%': { opacity: '0', transform: 'translateY(6px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideUp:  { '0%': { transform: 'translateY(100%)' }, '100%': { transform: 'translateY(0)' } },
        pulseRed: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.4' } },
      },
    },
  },
  plugins: [],
};
