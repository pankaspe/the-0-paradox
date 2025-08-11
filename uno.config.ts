// uno.config.ts
import {
  defineConfig,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    // ... i tuoi shortcut se ne hai
  ],
  theme: {
    // Qui definiamo il nostro tema personalizzato
    colors: {
      'abyss': '#0D1B2A',         // Un blu/grigio scurissimo per lo sfondo
      'starlight': '#7B8DDB',    // Un blu più chiaro, quasi viola, per i bordi e gli elementi UI
      'biolume': '#6EE7B7',       // Il nostro verde bioluminescente per gli accenti e le azioni
      'ghost': '#E0E1DD',         // Un bianco/grigio molto chiaro per il testo
    }
  },
  presets: [
    presetUno(),
    presetTypography(),
    presetWebFonts({
      fonts: {
        // Qui puoi definire dei font da Google Fonts, se vuoi
        sans: 'Inter', // Esempio
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})