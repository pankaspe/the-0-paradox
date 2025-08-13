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
  shortcuts: [
    {
      'grid-overlay': `
        [background-image:linear-gradient(to_right,rgba(123,141,219,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(123,141,219,0.05)_1px,transparent_1px)]
        [background-size:10px_10px]
      `,
      // --- Rarity Style Shortcuts ---
      // Common
      'rarity-border-common': 'border-green-400/30',
      'rarity-text-common':   'text-green-400',
      'rarity-bg-common':     'bg-green-900/20',
      // Rare
      'rarity-border-rare': 'border-blue-400/30',
      'rarity-text-rare':   'text-blue-400',
      'rarity-bg-rare':     'bg-blue-900/20',
      // Epic
      'rarity-border-epic': 'border-purple-400/30',
      'rarity-text-epic':   'text-purple-400',
      'rarity-bg-epic':     'bg-purple-900/20',
      // Seasonal (using red as you suggested)
      'rarity-border-seasonal': 'border-red-400/30',
      'rarity-text-seasonal':   'text-red-400',
      'rarity-bg-seasonal':     'bg-red-900/20',
    }
  ],
  theme: {
    colors: {
      'abyss': '#080f17ff',
      'starlight': '#7B8DDB',
      'biolume': '#6EE7B7',
      'ghost': '#E0E1DD',
      'glow-start': '#6EE7B7',
      'glow-end': '#7B8DDB',
    },
    extend: {
      keyframes: {
        'gradient-text-flow': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'pulse-fire': {
          'from': { filter: 'drop-shadow(0 0 8px rgba(255, 87, 34, 0.7)) drop-shadow(0 0 20px rgba(220, 38, 38, 0.5))' },
          'to': { filter: 'drop-shadow(0 0 12px rgba(255, 87, 34, 1)) drop-shadow(0 0 30px rgba(220, 38, 38, 0.7))' }
        }
      },
      animation: {
        'gradient-text': 'gradient-text-flow 4s ease infinite',
        'fade-in': 'fade-in 0.7s ease-in-out forwards',
      }
    }
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'Inter',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})