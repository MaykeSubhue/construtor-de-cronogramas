import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Protótipo isolado. Quando for integrar ao Django (plano_trabalho/front),
// basta apontar o proxy /plano-trabalho/api para o backend DRF e trocar
// src/mock/api.js por chamadas fetch reais.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // expõe na rede local (0.0.0.0) para acesso por outras máquinas
    port: 5173,
    open: true,
  },
})
