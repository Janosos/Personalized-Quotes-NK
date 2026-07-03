import React, { useEffect } from 'react';
import type { GarmentCustomization, GarmentPosition } from '../types';

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
    const updatedPositions = { ...config.positions };

    if (isCurrentlyActive) {
      // Toggle off
      updatedPositions[position] = {
        ...updatedPositions[position],
        active: false
      };
    } else {
      // Toggle on, initialize if needed
      updatedPositions[position] = {
        active: true,
        type: 'Estampado',
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

  const updatePositionField = (position: string, field: keyof GarmentPosition, value: any) => {
    const updatedPositions = { ...config.positions };
    updatedPositions[position] = {
      ...updatedPositions[position],
      [field]: value
    };

    onChange({
      ...config,
      positions: updatedPositions
    });
  };

  const handleFileUpload = (position: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 10MB
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert(`El archivo es demasiado grande. El límite es de 10 MB. Tu archivo pesa ${(file.size / (1024 * 1024)).toFixed(2)} MB.`);
      e.target.value = ''; // Reset input
      return;
    }

    // Check file format
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten archivos de imagen en formato JPEG, JPG o PNG.');
      e.target.value = ''; // Reset input
      return;
    }

    // Convert file to base64 preview
    const reader = new FileReader();
    reader.onloadend = () => {
      updatePositionField(position, 'file', file);
      updatePositionField(position, 'filePreview', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (position: string) => {
    updatePositionField(position, 'file', null);
    updatePositionField(position, 'filePreview', '');
  };

  const selectedModelColors = modelsData.find(m => m.name === config.model)?.colors || [];

  return (
    <div className="custom-card bg-black border border-primary-subtle-10">
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
              className={`btn btn-sm btn-outline-secondary ${config.color === color ? 'bg-primary text-white border-primary' : 'text-light'}`}
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
        <label className="form-label text-muted small uppercase fw-bold d-block">Áreas de Personalización:</label>
        <p className="text-muted small mb-3">Selecciona qué zonas deseas personalizar y configura sus detalles:</p>
        
        <div className="d-flex flex-wrap gap-2 mb-4">
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

        {/* Detalles por Posición Activa */}
        <div className="space-y-4">
          {Object.entries(config.positions)
            .filter(([_, pos]) => pos.active)
            .map(([posName, pos]) => (
              <div key={posName} className="p-3 mb-3 border border-secondary rounded bg-dark">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="font-display text-primary-brand m-0 fs-5">{posName}</h6>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-danger" 
                    onClick={() => handlePositionToggle(posName)}
                  >
                    Quitar Área
                  </button>
                </div>

                <div className="row g-3">
                  {/* Técnica */}
                  <div className="col-12 col-sm-6">
                    <label className="form-label text-muted small">Técnica:</label>
                    <select
                      className="form-select"
                      value={pos.type}
                      onChange={(e) => updatePositionField(posName, 'type', e.target.value)}
                    >
                      <option value="Estampado">Estampado (Serigrafía/DTF/Vinil)</option>
                      <option value="Bordado">Bordado</option>
                    </select>
                  </div>

                  {/* Medidas */}
                  <div className="col-12 col-sm-6">
                    <label className="form-label text-muted small">Medida aprox. en CM (Ej. 10x15):</label>
                    <input
                      type="text"
                      className="form-control"
                      value={pos.size}
                      onChange={(e) => updatePositionField(posName, 'size', e.target.value)}
                      placeholder="Ancho x Alto en CM"
                    />
                  </div>

                  {/* Subida de Diseño */}
                  <div className="col-12">
                    <label className="form-label text-muted small">Diseño de Referencia (Máx. 10MB, JPEG/PNG):</label>
                    
                    {!pos.filePreview ? (
                      <div className="border border-secondary border-dashed p-3 rounded text-center">
                        <input
                          type="file"
                          id={`file-${posName}`}
                          className="d-none"
                          accept=".jpeg,.jpg,.png"
                          onChange={(e) => handleFileUpload(posName, e)}
                        />
                        <label htmlFor={`file-${posName}`} className="m-0 cursor-pointer text-primary-brand font-display fs-5">
                          <i className="bi bi-cloud-arrow-up-fill me-2"></i>
                          Subir Archivo
                        </label>
                        <p className="text-muted small m-0 mt-1">El archivo se guardará como {posName.toLowerCase().replace(/\s+/g, '-')}.jpg/png</p>
                      </div>
                    ) : (
                      <div className="d-flex align-items-center gap-3 p-2 bg-black rounded border border-secondary">
                        <img 
                          src={pos.filePreview} 
                          alt="preview" 
                          className="object-fit-cover rounded border border-secondary"
                          style={{ width: '60px', height: '60px' }}
                        />
                        <div className="flex-grow-1 overflow-hidden">
                          <p className="small m-0 text-truncate text-light fw-semibold">{pos.file?.name}</p>
                          <p className="small m-0 text-muted">{(pos.file!.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeFile(posName)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
