import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',       // Fuerza la compilación a puros archivos planos (HTML/CSS/JS)
  trailingSlash: true,    // Requerido por cPanel: Crea carpetas físicas por ruta para evitar errores 404
  images: {
    unoptimized: true,    // Evita que busque un servidor Node activo para procesar imágenes
  },
  allowedDevOrigins: [
    "localhost",
    "*.trycloudflare.com", // <-- CLAVE: Permite que el túnel acceda a la app
    "*.localtunnel.me"
  ],
};

export default nextConfig;