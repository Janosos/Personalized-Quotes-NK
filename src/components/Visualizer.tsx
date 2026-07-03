import React from 'react';
import type { ProductType } from '../types';

interface VisualizerProps {
  productType: ProductType;
  selectedPositions: string[];
  onPositionToggle: (position: string) => void;
  // Extra options
  patchShape?: 'Rectangular' | 'Cuadrado' | 'Circular' | 'Forma del diseño';
}

export const Visualizer: React.FC<VisualizerProps> = ({
  productType,
  selectedPositions,
  onPositionToggle,
  patchShape = 'Rectangular'
}) => {
  const isPositionActive = (pos: string) => selectedPositions.includes(pos);

  const handleDotClick = (pos: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onPositionToggle(pos);
  };

  const renderRopaVisualizer = () => {
    return (
      <div className="row g-4 justify-content-center text-center">
        {/* VISTA FRONTAL */}
        <div className="col-12 col-md-6">
          <h5 className="text-muted mb-2 font-display">VISTA FRONTAL</h5>
          <div className="position-relative d-inline-block mx-auto bg-dark border border-secondary p-3 rounded" style={{ maxWidth: '280px', width: '100%' }}>
            {/* Outline SVG de Camiseta Frente */}
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white opacity-40 w-100" style={{ height: '240px' }}>
              <path d="M15 15 L25 5 L35 15 L35 25 L45 28 L55 28 L65 25 L65 15 L75 5 L85 15 L80 35 L75 35 L75 90 L25 90 L25 35 L20 35 Z" />
              {/* Cuello */}
              <path d="M42 20 Q50 25 58 20" />
            </svg>

            {/* Hotspots */}
            {/* Pecho Izquierdo */}
            <div 
              className="hotspot-container" 
              style={{ top: '35%', left: '38%' }}
            >
              <div 
                className={`hotspot-dot ${isPositionActive('Pecho Izquierdo') ? 'active' : ''}`}
                onClick={(e) => handleDotClick('Pecho Izquierdo', e)}
              />
              <div className="hotspot-label">Pecho Izquierdo</div>
            </div>

            {/* Pecho Derecho */}
            <div 
              className="hotspot-container" 
              style={{ top: '35%', left: '62%' }}
            >
              <div 
                className={`hotspot-dot ${isPositionActive('Pecho Derecho') ? 'active' : ''}`}
                onClick={(e) => handleDotClick('Pecho Derecho', e)}
              />
              <div className="hotspot-label">Pecho Derecho</div>
            </div>

            {/* Pecho en Medio */}
            <div 
              className="hotspot-container" 
              style={{ top: '37%', left: '50%' }}
            >
              <div 
                className={`hotspot-dot ${isPositionActive('Pecho en Medio') ? 'active' : ''}`}
                onClick={(e) => handleDotClick('Pecho en Medio', e)}
              />
              <div className="hotspot-label">Pecho en Medio</div>
            </div>

            {/* Enfrente (Grande) */}
            <div 
              className="hotspot-container" 
              style={{ top: '55%', left: '50%' }}
            >
              <div 
                className={`hotspot-dot ${isPositionActive('Enfrente') ? 'active' : ''}`}
                onClick={(e) => handleDotClick('Enfrente', e)}
              />
              <div className="hotspot-label">Frente Completo</div>
            </div>

            {/* Manga Izquierda */}
            <div 
              className="hotspot-container" 
              style={{ top: '25%', left: '18%' }}
            >
              <div 
                className={`hotspot-dot ${isPositionActive('Manga Izquierda') ? 'active' : ''}`}
                onClick={(e) => handleDotClick('Manga Izquierda', e)}
              />
              <div className="hotspot-label">Manga Izquierda</div>
            </div>

            {/* Manga Derecha */}
            <div 
              className="hotspot-container" 
              style={{ top: '25%', left: '82%' }}
            >
              <div 
                className={`hotspot-dot ${isPositionActive('Manga Derecha') ? 'active' : ''}`}
                onClick={(e) => handleDotClick('Manga Derecha', e)}
              />
              <div className="hotspot-label">Manga Derecha</div>
            </div>
          </div>
        </div>

        {/* VISTA TRASERA */}
        <div className="col-12 col-md-6">
          <h5 className="text-muted mb-2 font-display">VISTA POSTERIOR</h5>
          <div className="position-relative d-inline-block mx-auto bg-dark border border-secondary p-3 rounded" style={{ maxWidth: '280px', width: '100%' }}>
            {/* Outline SVG de Camiseta Detrás */}
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white opacity-40 w-100" style={{ height: '240px' }}>
              <path d="M15 15 L25 5 L35 15 L35 25 L45 28 L55 28 L65 25 L65 15 L75 5 L85 15 L80 35 L75 35 L75 90 L25 90 L25 35 L20 35 Z" />
              {/* Cuello Detrás */}
              <path d="M42 20 Q50 18 58 20" />
            </svg>

            {/* Hotspots */}
            {/* Espalda */}
            <div 
              className="hotspot-container" 
              style={{ top: '48%', left: '50%' }}
            >
              <div 
                className={`hotspot-dot ${isPositionActive('Espalda') ? 'active' : ''}`}
                onClick={(e) => handleDotClick('Espalda', e)}
              />
              <div className="hotspot-label">Espalda</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGorrasVisualizer = () => {
    return (
      <div className="row g-4 justify-content-center text-center">
        {/* VISTA FRENTE */}
        <div className="col-12 col-md-6">
          <h5 className="text-muted mb-2 font-display">VISTA FRONTAL</h5>
          <div className="position-relative d-inline-block mx-auto bg-dark border border-secondary p-3 rounded" style={{ maxWidth: '280px', width: '100%' }}>
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white opacity-40 w-100" style={{ height: '200px' }}>
              {/* Gorra de frente outline */}
              <path d="M15 70 Q10 40 30 25 Q50 20 70 25 Q90 40 85 70" />
              <path d="M8 72 Q50 85 92 72 Q85 62 15 62 Z" />
              <circle cx="50" cy="23" r="3" />
            </svg>

            {/* Hotspot Enfrente */}
            <div 
              className="hotspot-container" 
              style={{ top: '45%', left: '50%' }}
            >
              <div 
                className={`hotspot-dot ${isPositionActive('Enfrente') ? 'active' : ''}`}
                onClick={(e) => handleDotClick('Enfrente', e)}
              />
              <div className="hotspot-label">Bordado/TPU Enfrente</div>
            </div>
          </div>
        </div>

        {/* VISTA COSTADOS */}
        <div className="col-12 col-md-6">
          <h5 className="text-muted mb-2 font-display">VISTA PERFIL</h5>
          <div className="position-relative d-inline-block mx-auto bg-dark border border-secondary p-3 rounded" style={{ maxWidth: '280px', width: '100%' }}>
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white opacity-40 w-100" style={{ height: '200px' }}>
              {/* Gorra perfil outline */}
              <path d="M15 70 Q18 35 55 35 Q85 35 90 70" />
              <path d="M90 70 Q60 78 15 70 Q10 88 5 90" />
              <path d="M85 72 L95 76 L90 85 Q75 80 85 72 Z" /> {/* Visera */}
            </svg>

            {/* Hotspot Lado Izquierdo */}
            <div 
              className="hotspot-container" 
              style={{ top: '55%', left: '40%' }}
            >
              <div 
                className={`hotspot-dot ${isPositionActive('Lado izquierdo') ? 'active' : ''}`}
                onClick={(e) => handleDotClick('Lado izquierdo', e)}
              />
              <div className="hotspot-label">Costado Izquierdo</div>
            </div>

            {/* Hotspot Lado Derecho */}
            <div 
              className="hotspot-container" 
              style={{ top: '55%', left: '70%' }}
            >
              <div 
                className={`hotspot-dot ${isPositionActive('Lado Derecho') ? 'active' : ''}`}
                onClick={(e) => handleDotClick('Lado Derecho', e)}
              />
              <div className="hotspot-label">Costado Derecho</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderParchesVisualizer = () => {
    const getShapeSVG = () => {
      switch (patchShape) {
        case 'Circular':
          return <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" className="text-white opacity-50" />;
        case 'Cuadrado':
          return <rect x="15" y="15" width="70" height="70" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" className="text-white opacity-50" />;
        case 'Forma del diseño':
          return (
            <path 
              d="M30 20 C 35 15, 65 15, 70 20 C 85 30, 85 70, 70 80 C 65 85, 35 85, 30 80 C 15 70, 15 30, 30 20 Z" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeDasharray="4 4" 
              className="text-white opacity-50" 
            />
          );
        case 'Rectangular':
        default:
          return <rect x="10" y="25" width="80" height="50" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" className="text-white opacity-50" />;
      }
    };

    return (
      <div className="text-center">
        <h5 className="text-muted mb-2 font-display">SILUETA DEL PARCHE</h5>
        <div className="position-relative d-inline-block mx-auto bg-dark border border-secondary p-4 rounded" style={{ maxWidth: '350px', width: '100%' }}>
          <svg viewBox="0 0 100 100" className="w-100" style={{ height: '220px' }}>
            {getShapeSVG()}
            {/* Texto en medio */}
            <text x="50" y="52" fill="#888" fontSize="6" textAnchor="middle" fontFamily="sans-serif">
              DISEÑO & CONTORNO
            </text>
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="custom-card mb-4 bg-black">
      <h3 className="font-display text-primary-brand mb-3">
        <i className="bi bi-eye-fill me-2"></i>
        Visualizador Interactivo
      </h3>
      <p className="text-muted small mb-4">
        {productType === 'parches' 
          ? 'Visualiza la forma y proporción del contorno para tu parche bordado.' 
          : 'Haz clic en los puntos rojos de la silueta para activar o desactivar las áreas que deseas personalizar.'}
      </p>

      {productType === 'ropa' && renderRopaVisualizer()}
      {productType === 'gorras' && renderGorrasVisualizer()}
      {productType === 'parches' && renderParchesVisualizer()}
    </div>
  );
};
