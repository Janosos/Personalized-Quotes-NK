import React, { useEffect } from 'react';
import type { GarmentCustomization } from '../types';

interface RopaConfigProps {
  config: GarmentCustomization;
  onChange: (newConfig: GarmentCustomization) => void;
}

// Data from PDF
const modelsData = [
  {
    name: 'Oversize',
    colors: ['Negro', 'Blanco', 'Beige', 'Verde', 'Chocolate', 'Arena', 'Azul', 'Acero (plomo)', 'Azul Marino', 'Rojo']
  },
  {
    name: 'T-shirt 100% Algodón Peinado',
    colors: ['Blanco', 'Negro']
  },
  {
    name: 'T-shirt 100% Algodón (Regular)',
    colors: ['Marino', 'Azul Rey', 'Rojo', 'Cherry', 'Kaki', 'Verde Botella', 'Morado Intenso', 'Salmón', 'Café Tabaco', 'Jaspe', 'Hueso']
  },
  {
    name: 'Tank Top',
    colors: ['Blanco', 'Negro', 'Jaspe', 'Marino', 'Azul Rey', 'Rojo']
  },
  {
    name: 'Hoodie',
    colors: ['Jaspe', 'Blanco', 'Kaki', 'Marino', 'Negro', 'Azul Rey', 'Rojo']
  },
  {
    name: 'Sudadera Cuello Redondo',
    colors: ['Jaspe', 'Blanco', 'Kaki', 'Marino', 'Negro', 'Azul Rey', 'Rojo']
  }
];

const availablePositions = [
  'Pecho Izquierdo',
  'Pecho Derecho',
  'Pecho en Medio',
  'Enfrente',
  'Espalda',
  'Manga Izquierda',
  'Manga Derecha'
];

export const RopaConfig: React.FC<RopaConfigProps> = ({ config, onChange }) => {
  // Auto-select first color when model changes
  useEffect(() => {
    const selectedModelData = modelsData.find(m => m.name === config.model);
    if (selectedModelData && !selectedModelData.colors.includes(config.color)) {
      onChange({
        ...config,
        color: selectedModelData.colors[0]
      });
    }
  }, [config.model]);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...config,
      model: e.target.value
    });
  };

  const handleColorSelect = (color: string) => {
    onChange({
      ...config,
      color
    });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qty = parseInt(e.target.value) || 1;
    onChange({
      ...config,
      quantity: Math.max(1, qty)
    });
  };

  const handlePositionToggle = (position: string) => {
    const isCurrentlyActive = config.positions[position]?.active;
    const activeCount = Object.values(config.positions).filter(p => p.active).length;

    if (!isCurrentlyActive && activeCount >= 2) {
      alert('Solo es posible personalizar un máximo de 2 áreas por prenda (Bordado y Bordado, Bordado y DTF, DTF y Bordado, o DTF y DTF).');
      return;
    }

    const updatedPositions = { ...config.positions };

    if (isCurrentlyActive) {
      updatedPositions[position] = {
        ...updatedPositions[position],
        active: false
      };
    } else {
      updatedPositions[position] = {
        active: true,
        type: 'DTF',
        size: '15x15',
        file: null,
        filePreview: ''
      };
    }

    onChange({
      ...config,
      positions: updatedPositions
    });
  };

  const selectedModelColors = modelsData.find(m => m.name === config.model)?.colors || [];

  return (
    <div className="custom-card bg-white border border-light-subtle mb-4">
      <h3 className="font-display text-primary-brand mb-4">
        <i className="bi bi-person-fill-gear me-2"></i>
        Configurar Ropa Personalizada
      </h3>

      {/* 1. Seleccionar Modelo */}
      <div className="mb-4">
        <label className="form-label text-muted small uppercase fw-bold">Modelo de Prenda:</label>
        <select 
          className="form-select"
          value={config.model}
          onChange={handleModelChange}
        >
          {modelsData.map(m => (
            <option key={m.name} value={m.name}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* 2. Seleccionar Color */}
      <div className="mb-4">
        <label className="form-label text-muted small uppercase fw-bold d-block">Color de Prenda:</label>
        <div className="d-flex flex-wrap gap-2 mt-1">
          {selectedModelColors.map(color => (
            <button
              key={color}
              type="button"
              className={`btn btn-sm btn-outline-secondary ${config.color === color ? 'bg-primary text-white border-primary' : 'text-dark'}`}
              onClick={() => handleColorSelect(color)}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Cantidad */}
      <div className="mb-4">
        <label className="form-label text-muted small uppercase fw-bold">Cantidad de prendas (Mínimo 1pz):</label>
        <div className="input-group" style={{ maxWidth: '180px' }}>
          <button 
            type="button" 
            className="btn btn-outline-secondary" 
            onClick={() => handleQuantityChange({ target: { value: String(config.quantity - 1) } } as any)}
          >
            -
          </button>
          <input 
            type="number" 
            className="form-control text-center" 
            value={config.quantity} 
            onChange={handleQuantityChange}
            min="1"
          />
          <button 
            type="button" 
            className="btn btn-outline-secondary" 
            onClick={() => handleQuantityChange({ target: { value: String(config.quantity + 1) } } as any)}
          >
            +
          </button>
        </div>
      </div>

      {/* 4. Posiciones de Personalización */}
      <div className="mb-4">
        <label className="form-label text-muted small uppercase fw-bold d-block">Seleccionar Áreas de Personalización:</label>
        <p className="text-muted small mb-3">
          Haz clic para activar o desactivar (máximo 2 áreas). Para configurar cada área, selecciónala en el visualizador interactivo de arriba.
        </p>
        
        <div className="d-flex flex-wrap gap-2">
          {availablePositions.map(pos => {
            const isActive = config.positions[pos]?.active;
            return (
              <span
                key={pos}
                className={`position-badge ${isActive ? 'active' : ''}`}
                onClick={() => handlePositionToggle(pos)}
              >
                {isActive ? <i className="bi bi-check-circle-fill me-1"></i> : null}
                {pos}
              </span>
            );
          })}
        </div>
      </div>

      {/* 5. Detalles Adicionales */}
      <div className="mb-2">
        <label className="form-label text-muted small uppercase fw-bold">Detalles adicionales para tu personalizado:</label>
        <textarea
          className="form-control"
          rows={3}
          value={config.additionalDetails}
          onChange={(e) => onChange({ ...config, additionalDetails: e.target.value })}
          placeholder="Comentarios sobre el tipo de tela, ubicación exacta de los logos o instrucciones específicas de producción..."
        />
      </div>
    </div>
  );
};
