import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: {
    'btn-icon': 'flex items-center justify-center h-10 w-10 rounded-lg text-text-main/80 bg-transparent hover:bg-surface-hover transition-colors focus-visible:(outline-none ring-2 ring-primary)',
  },
  rules: [
    ['preserve-3d', { 'transform-style': 'preserve-3d' }],
    ['bg-grid-pattern', {
      'background-image': `
        linear-gradient(to right, rgb(var(--color-primary) / 0.4) 1px, transparent 1px),
        linear-gradient(to bottom, rgb(var(--color-primary) / 0.4) 1px, transparent 1px)
      `,
      'background-size': '40px 100px',
    }],
  ],
  theme: {
    colors: {
      'page': 'rgb(var(--color-bg-page) / <alpha-value>)',
      'surface': 'rgb(var(--color-bg-surface) / <alpha-value>)',
      'surface-hover': 'rgb(var(--color-bg-surface-hover) / <alpha-value>)',
      
      'primary': 'rgb(var(--color-primary) / <alpha-value>)',
      'primary-hover': 'rgb(var(--color-primary-hover) / <alpha-value>)',
      
      // --- NUOVI COLORI AGGIUNTI QUI ---
      'secondary': 'rgb(var(--color-secondary) / <alpha-value>)',
      'secondary-hover': 'rgb(var(--color-secondary-hover) / <alpha-value>)',

      'text-title': 'rgb(var(--color-text-title) / <alpha-value>)',
      // --- FINE AGGIUNTA ---
      
      'text-main': 'rgb(var(--color-text-main) / <alpha-value>)',
      'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',

      'border': 'rgb(var(--color-border) / <alpha-value>)',
      
      'success': 'rgb(var(--color-success) / <alpha-value>)',
      'error': 'rgb(var(--color-error) / <alpha-value>)',
    },
  },
  presets: [
    presetUno({
      dark: 'class',
    }),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetTypography(),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: 'Inter:400,700',
        mono: 'Source Code Pro:400,700',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  preflights: [
    {
      getCSS: ({ theme }) => `
        :root {
          /* Colori Sfondo */
          --color-bg-page: 249 249 249;
          --color-bg-surface: 255 255 255;
          --color-bg-surface-hover: 240 240 240;
          
          /* Colori Primari (Blu) */
          --color-primary: 38 132 255;
          --color-primary-hover: 80 155 255;

          /* === NUOVE VARIABILI CSS === */
          /* Colori Secondari (Ciano/Turchese) */
          --color-secondary: 20 184 166; /* Teal 500 */
          --color-secondary-hover: 13 148 136; /* Teal 600 */
          
          /* Colori Testo */
          --color-text-title: 0 0 0; /* Nero puro per i titoli in tema chiaro */
          /* === FINE NUOVE VARIABILI === */

          --color-text-main: 20 20 20;
          --color-text-muted: 100 100 100;
          
          --color-border: 220 220 220;

          --color-success: 39 174 96;
          --color-error: 192 57 43;
        }

        .dark {
          /* Colori Sfondo */
          --color-bg-page: 18 18 18;
          --color-bg-surface: 28 28 28;
          --color-bg-surface-hover: 40 40 40;

          /* Colori Primari (Blu) */
          --color-primary: 38 132 255;
          --color-primary-hover: 80 155 255;

          /* === NUOVE VARIABILI CSS === */
          /* Colori Secondari (Ciano/Turchese) */
          --color-secondary: 45 212 191; /* Teal 400 */
          --color-secondary-hover: 20 184 166; /* Teal 500 */
          
          /* Colori Testo */
          --color-text-title: 255 255 255; /* Bianco puro per i titoli in tema scuro */
          /* === FINE NUOVE VARIABILI === */

          --color-text-main: 235 235 235;
          --color-text-muted: 160 160 160;

          --color-border: 50 50 50;
          
          --color-success: 46 204 113;
          --color-error: 231 76 60;
        }

        @keyframes scroll-background {
          from { background-position: 0 0; }
          to { background-position: 0 -200px; }
        }
      `,
    },
  ],
})