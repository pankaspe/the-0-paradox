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
  shortcuts: [],
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