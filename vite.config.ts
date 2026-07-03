import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // (O el plugin del framework que uses)

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Le dice a Vite que escuche en todas las direcciones de red
    allowedHosts: [
      '.trycloudflare.com', // Permite que el túnel de Cloudflare acceda
      '.localtunnel.me'
    ],
    // port: 3000, // Descomenta esta línea si prefieres forzar el puerto 3000 en lugar del 5173
  }
})