// uno.config.ts
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
  // Scorciatoie riutilizzabili per mantenere il codice JSX pulito
  shortcuts: {
    'btn-icon': 'flex items-center justify-center h-10 w-10 rounded-lg text-text-main/80 bg-transparent hover:bg-surface-hover transition-colors focus-visible:(outline-none ring-2 ring-primary)',
  },
  rules: [
    // Crea la classe 'preserve-3d' che applica transform-style: preserve-3d
    ['preserve-3d', { 'transform-style': 'preserve-3d' }],
    
    // Crea la classe 'bg-grid-pattern' per il nostro pavimento
    // Usa la variabile CSS --color-primary per essere consistente con il tema
    ['bg-grid-pattern', {
      'background-image': `
        linear-gradient(to right, rgb(var(--color-primary) / 0.4) 1px, transparent 1px),
        linear-gradient(to bottom, rgb(var(--color-primary) / 0.4) 1px, transparent 1px)
      `,
      'background-size': '40px 100px', // Dimensioni che simulano la prospettiva
    }],
  ],
  theme: {
    colors: {
      // =================================================================
      // >>> LA CORREZIONE È QUI <<<
      // Diciamo a UnoCSS di usare la funzione rgb() con le nostre variabili.
      // <alpha-value> è un placeholder speciale di UnoCSS che permette
      // di usare l'opacità, es. bg-page/50. Se non specificata, è 1.
      // =================================================================
      'page': 'rgb(var(--color-bg-page) / <alpha-value>)',
      'surface': 'rgb(var(--color-bg-surface) / <alpha-value>)',
      'surface-hover': 'rgb(var(--color-bg-surface-hover) / <alpha-value>)',
      
      'primary': 'rgb(var(--color-primary) / <alpha-value>)',
      'primary-hover': 'rgb(var(--color-primary-hover) / <alpha-value>)',

      'text-main': 'rgb(var(--color-text-main) / <alpha-value>)',
      'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',

      'border': 'rgb(var(--color-border) / <alpha-value>)',
      
      'success': 'rgb(var(--color-success) / <alpha-value>)',
      'error': 'rgb(var(--color-error) / <alpha-value>)',
    },
  },
  presets: [
    presetUno({
      // Abilita il supporto per il selettore .dark per il theming
      dark: 'class',
    }),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetTypography(),
    presetWebFonts({
      provider: 'google', // default
      fonts: {
        // Font principale, pulito e moderno
        sans: 'Inter:400,700',
        // Font per elementi numerici o da "codice", per un look tech
        mono: 'Source Code Pro:400,700',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  // Regole CSS pure per definire le nostre variabili di colore per i temi
  preflights: [
    {
      getCSS: ({ theme }) => `
        :root {
          --color-bg-page: 249 249 249; /* Grigio chiarissimo */
          --color-bg-surface: 255 255 255;
          --color-bg-surface-hover: 240 240 240;
          
          --color-primary: 38 132 255; /* Blu vibrante */
          --color-primary-hover: 80 155 255;

          --color-text-main: 20 20 20;
          --color-text-muted: 100 100 100;
          
          --color-border: 220 220 220;

          --color-success: 39 174 96;
          --color-error: 192 57 43;
        }

        .dark {
          --color-bg-page: 18 18 18; /* Grigio quasi nero */
          --color-bg-surface: 28 28 28;
          --color-bg-surface-hover: 40 40 40;

          --color-primary: 38 132 255; /* Il blu funziona bene su entrambi */
          --color-primary-hover: 80 155 255;

          --color-text-main: 235 235 235;
          --color-text-muted: 160 160 160;

          --color-border: 50 50 50;
          
          --color-success: 46 204 113;
          --color-error: 231 76 60;
        }

        @keyframes scroll-background {
          from { background-position: 0 0; }
          to { background-position: 0 -200px; } /* Deve essere un multiplo del background-size verticale (100px * 2) per un loop perfetto */
        }
      `,
    },
  ],
})