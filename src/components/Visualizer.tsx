import React from 'react';
import type { ProductType } from '../types';

interface VisualizerProps {
  productType: ProductType;
  selectedPositions: string[];
  onPositionToggle: (position: string) => void;
  selectedEditingPosition: string | null;
  onSelectPositionForEditing: (position: string) => void;
  patchShape?: 'Rectangular' | 'Cuadrado' | 'Circular' | 'Forma del diseño';
}

export const Visualizer: React.FC<VisualizerProps> = ({
  productType,
  selectedPositions,
  onPositionToggle,
  selectedEditingPosition,
  onSelectPositionForEditing,
  patchShape = 'Rectangular'
}) => {
  const isPositionActive = (pos: string) => selectedPositions.includes(pos);
  const isPositionEditing = (pos: string) => selectedEditingPosition === pos;

  const handleZoneClick = (pos: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onPositionToggle(pos);
    onSelectPositionForEditing(pos);
  };

  const getZoneStyles = (pos: string) => {
    const active = isPositionActive(pos);
    const editing = isPositionEditing(pos);
    
    if (editing) {
      return {
        fill: 'rgba(255, 51, 51, 0.22)',
        stroke: '#FF3333',
        strokeWidth: 2,
        strokeDasharray: '3 2',
        cursor: 'pointer'
      };
    } else if (active) {
      return {
        fill: 'rgba(255, 51, 51, 0.08)',
        stroke: 'rgba(255, 51, 51, 0.5)',
        strokeWidth: 1.5,
        cursor: 'pointer'
      };
    } else {
      return {
        fill: 'transparent',
        stroke: 'rgba(0, 0, 0, 0.12)',
        strokeWidth: 0.8,
        strokeDasharray: '3 3',
        cursor: 'pointer'
      };
    }
  };

  const renderRopaVisualizer = () => {
    const shirtFrontPath = "M 40 16 Q 50 23 60 16 L 74 21 L 88 36 L 80 46 L 71 38 L 71 88 Q 50 92 29 88 L 29 38 L 20 46 L 12 36 L 26 21 Z";
    const shirtBackPath = "M 40 16 Q 50 19 60 16 L 74 21 L 88 36 L 80 46 L 71 38 L 71 88 Q 50 92 29 88 L 29 38 L 20 46 L 12 36 L 26 21 Z";

    return (
      <div className="row g-4 justify-content-center text-center">
        {/* VISTA FRONTAL */}
        <div className="col-12 col-md-6">
          <h5 className="text-muted mb-2 font-display fs-6">VISTA FRONTAL (Haz clic en una zona para configurar)</h5>
          <div className="position-relative d-inline-block mx-auto bg-white border border-light-subtle p-3 rounded" style={{ maxWidth: '280px', width: '100%' }}>
            <svg viewBox="0 0 100 100" className="w-100" style={{ height: '240px' }}>
              {/* Shirt Outline */}
              <path d={shirtFrontPath} fill="#F8FAFC" stroke="#64748B" strokeWidth="1.5" />
              {/* Collar Line */}
              <path d="M 40 16 Q 50 24 60 16" fill="none" stroke="#475569" strokeWidth="1.2" />
              {/* Sleeve stitch guidelines */}
              <path d="M 29 38 L 20 46" fill="none" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="1 1" />
              <path d="M 71 38 L 80 46" fill="none" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="1 1" />

              {/* Clickable Overlay Zones */}
              {/* Pecho Izquierdo */}
              <rect x="33" y="27" width="11" height="11" rx="2" {...getZoneStyles('Pecho Izquierdo')} onClick={(e) => handleZoneClick('Pecho Izquierdo', e)} />
              
              {/* Pecho Derecho */}
              <rect x="56" y="27" width="11" height="11" rx="2" {...getZoneStyles('Pecho Derecho')} onClick={(e) => handleZoneClick('Pecho Derecho', e)} />
              
              {/* Pecho en Medio */}
              <rect x="45" y="29" width="10" height="9" rx="2" {...getZoneStyles('Pecho en Medio')} onClick={(e) => handleZoneClick('Pecho en Medio', e)} />
              
              {/* Frente Completo */}
              <rect x="31" y="44" width="38" height="34" rx="3" {...getZoneStyles('Enfrente')} onClick={(e) => handleZoneClick('Enfrente', e)} />
              
              {/* Manga Izquierda */}
              <path d="M 26 21 L 12 36 L 20 46 L 29 38 Z" {...getZoneStyles('Manga Izquierda')} onClick={(e) => handleZoneClick('Manga Izquierda', e)} />
              
              {/* Manga Derecha */}
              <path d="M 74 21 L 88 36 L 80 46 L 71 38 Z" {...getZoneStyles('Manga Derecha')} onClick={(e) => handleZoneClick('Manga Derecha', e)} />
            </svg>
          </div>
        </div>

        {/* VISTA TRASERA */}
        <div className="col-12 col-md-6">
          <h5 className="text-muted mb-2 font-display fs-6">VISTA POSTERIOR (Haz clic en una zona para configurar)</h5>
          <div className="position-relative d-inline-block mx-auto bg-white border border-light-subtle p-3 rounded" style={{ maxWidth: '280px', width: '100%' }}>
            <svg viewBox="0 0 100 100" className="w-100" style={{ height: '240px' }}>
              {/* Shirt Outline Back */}
              <path d={shirtBackPath} fill="#F8FAFC" stroke="#64748B" strokeWidth="1.5" />
              {/* Collar Line Back */}
              <path d="M 40 16 Q 50 19 60 16" fill="none" stroke="#475569" strokeWidth="1.2" />
              {/* Sleeve stitching */}
              <path d="M 29 38 L 20 46" fill="none" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="1 1" />
              <path d="M 71 38 L 80 46" fill="none" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="1 1" />

              {/* Clickable Zone Espalda */}
              <rect x="28" y="28" width="44" height="50" rx="3" {...getZoneStyles('Espalda')} onClick={(e) => handleZoneClick('Espalda', e)} />
            </svg>
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
          <h5 className="text-muted mb-2 font-display fs-6">VISTA FRONTAL</h5>
          <div className="position-relative d-inline-block mx-auto bg-white border border-light-subtle p-3 rounded" style={{ maxWidth: '280px', width: '100%' }}>
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-dark w-100" style={{ height: '200px' }}>
              <path d="M15 70 Q10 40 30 25 Q50 20 70 25 Q90 40 85 70" stroke="#64748B" />
              <path d="M8 72 Q50 85 92 72 Q85 62 15 62 Z" stroke="#64748B" />
              <circle cx="50" cy="23" r="3" stroke="#64748B" />

              <path d="M30 35 Q50 28 70 35 Q78 50 78 60 Q50 63 22 60 Q22 50 30 35 Z" {...getZoneStyles('Enfrente')} onClick={(e) => handleZoneClick('Enfrente', e)} />
            </svg>
          </div>
        </div>

        {/* VISTA COSTADOS */}
        <div className="col-12 col-md-6">
          <h5 className="text-muted mb-2 font-display fs-6">VISTA PERFIL</h5>
          <div className="position-relative d-inline-block mx-auto bg-white border border-light-subtle p-3 rounded" style={{ maxWidth: '280px', width: '100%' }}>
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-dark w-100" style={{ height: '200px' }}>
              <path d="M15 70 Q18 35 55 35 Q85 35 90 70" stroke="#64748B" />
              <path d="M90 70 Q60 78 15 70 Q10 88 5 90" stroke="#64748B" />
              <path d="M85 72 L95 76 L90 85 Q75 80 85 72 Z" stroke="#64748B" />

              <rect x="22" y="44" width="22" height="20" rx="3" {...getZoneStyles('Lado izquierdo')} onClick={(e) => handleZoneClick('Lado izquierdo', e)} />
              <rect x="56" y="44" width="22" height="20" rx="3" {...getZoneStyles('Lado Derecho')} onClick={(e) => handleZoneClick('Lado Derecho', e)} />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  const renderParchesVisualizer = () => {
    const getShapeSVG = () => {
      switch (patchShape) {
        case 'Circular':
          return <circle cx="50" cy="50" r="40" fill="none" stroke="#FF3333" strokeWidth="1.5" strokeDasharray="4 4" />;
        case 'Cuadrado':
          return <rect x="15" y="15" width="70" height="70" rx="4" fill="none" stroke="#FF3333" strokeWidth="1.5" strokeDasharray="4 4" />;
        case 'Forma del diseño':
          return (
            <path 
              d="M30 20 C 35 15, 65 15, 70 20 C 85 30, 85 70, 70 80 C 65 85, 35 85, 30 80 C 15 70, 15 30, 30 20 Z" 
              fill="none" 
              stroke="#FF3333" 
              strokeWidth="1.5" 
              strokeDasharray="4 4" 
            />
          );
        case 'Rectangular':
        default:
          return <rect x="10" y="25" width="80" height="50" rx="4" fill="none" stroke="#FF3333" strokeWidth="1.5" strokeDasharray="4 4" />;
      }
    };

    return (
      <div className="text-center">
        <h5 className="text-muted mb-2 font-display">SILUETA DEL PARCHE</h5>
        <div className="position-relative d-inline-block mx-auto bg-white border border-light-subtle p-4 rounded" style={{ maxWidth: '350px', width: '100%' }}>
          <svg viewBox="0 0 100 100" className="w-100" style={{ height: '220px' }}>
            {getShapeSVG()}
            <text x="50" y="52" fill="#64748B" fontSize="6" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">
              DISEÑO & CONTORNO
            </text>
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="custom-card mb-4 bg-white border border-light-subtle">
      <h3 className="font-display text-primary-brand mb-3">
        <i className="bi bi-eye-fill me-2"></i>
        Visualizador Interactivo
      </h3>
      <p className="text-muted small mb-4">
        {productType === 'parches' 
          ? 'Visualiza la forma y proporción del contorno para tu parche bordado.' 
          : 'Haz clic directamente sobre la prenda para seleccionar y cambiar las posiciones de personalización.'}
      </p>

      {productType === 'ropa' && renderRopaVisualizer()}
      {productType === 'gorras' && renderGorrasVisualizer()}
      {productType === 'parches' && renderParchesVisualizer()}
    </div>
  );
};
