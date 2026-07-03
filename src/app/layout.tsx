import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nakama | Cotizador Personalizado',
  description: 'Cotizador Personalizado de Nakama - Configura tu ropa, parches y gorras.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Teko:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
      </head>
      <body className="bg-light text-dark">
        {children}
      </body>
    </html>
  );
}
