import React, { useEffect } from 'react';
import type { CapCustomization, CapPosition } from '../types';

interface GorrasConfigProps {
  config: CapCustomization;
  onChange: (newConfig: CapCustomization) => void;
}

const capModels = ['Snapback (Visera plana)', 'Trucker (Malla)', 'Dad Hat (Visera curva)', 'Otro (Especificar en detalles)'];

export const GorrasConfig: React.FC<GorrasConfigProps> = ({ config, onChange }) => {
  
  // Enforce position activity based on chosen package option
  useEffect(() => {
    const updatedPositions = { ...config.positions };
    
    // Enfrente is always active
    if (!updatedPositions['Enfrente']) {
      updatedPositions['Enfrente'] = { active: true, type: 'Bordado', size: 'Regular', file: null, filePreview: '' };
    } else {
      updatedPositions['Enfrente'].active = true;
    }

    if (!updatedPositions['Lado izquierdo']) {
      updatedPositions['Lado izquierdo'] = { active: false, type: 'Bordado', size: 'Regular', file: null, filePreview: '' };
    }
    if (!updatedPositions['Lado Derecho']) {
      updatedPositions['Lado Derecho'] = { active: false, type: 'Bordado', size: 'Regular', file: null, filePreview: '' };
    }

    if (config.option === 'Bordado Al frente') {
      updatedPositions['Lado izquierdo'].active = false;
      updatedPositions['Lado Derecho'].active = false;
    } else if (config.option === 'Bordado Al frente y un costado') {
      // Exactly one side must be active. If both are active or both are inactive, default to left side
      const leftActive = updatedPositions['Lado izquierdo'].active;
      const rightActive = updatedPositions['Lado Derecho'].active;
      if ((leftActive && rightActive) || (!leftActive && !rightActive)) {
        updatedPositions['Lado izquierdo'].active = true;
        updatedPositions['Lado Derecho'].active = false;
      }
    } else if (config.option === 'Bordado Al frente y ambos costados') {
      updatedPositions['Lado izquierdo'].active = true;
      updatedPositions['Lado Derecho'].active = true;
    }

    onChange({
      ...config,
      positions: updatedPositions
    });
  }, [config.option]);

  const handleOptionChange = (option: CapCustomization['option']) => {
    onChange({
      ...config,
      option
    });
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...config,
      model: e.target.value
    });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qty = parseInt(e.target.value) || 1;
    onChange({
      ...config,
      quantity: Math.max(1, qty)
    });
  };

  const handleToggleSide = (side: 'Lado izquierdo' | 'Lado Derecho') => {
    if (config.option !== 'Bordado Al frente y un costado') return;

    const updatedPositions = { ...config.positions };
    if (side === 'Lado izquierdo') {
      updatedPositions['Lado izquierdo'].active = true;
      updatedPositions['Lado Derecho'].active = false;
    } else {
      updatedPositions['Lado izquierdo'].active = false;
      updatedPositions['Lado Derecho'].active = true;
    }

    onChange({
      ...config,
      positions: updatedPositions
    });
  };

  const updatePositionField = (position: string, field: keyof CapPosition, value: any) => {
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
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`El archivo es demasiado grande. El límite es de 10 MB. Tu archivo pesa ${(file.size / (1024 * 1024)).toFixed(2)} MB.`);
      e.target.value = '';
      return;
    }

    // Check file format
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten archivos de imagen en formato JPEG, JPG o PNG.');
      e.target.value = '';
      return;
    }

    // Convert file to base64
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

  return (
    <div className="custom-card bg-black border border-primary-subtle-10">
      <h3 className="font-display text-primary-brand mb-4">
        <i className="bi bi-capslock-fill me-2"></i>
        Configurar Gorras Personalizadas
      </h3>

      {/* 1. Tipo de Distribución / Opciones del PDF */}
      <div className="mb-4">
        <label className="form-label text-muted small uppercase fw-bold">Distribución de Bordado:</label>
        <div className="row g-2">
          {['Bordado Al frente', 'Bordado Al frente y un costado', 'Bordado Al frente y ambos costados'].map(opt => (
            <div key={opt} className="col-12">
              <div 
                className={`p-3 border rounded cursor-pointer d-flex align-items-center ${config.option === opt ? 'border-danger bg-danger bg-opacity-10 text-white' : 'border-secondary bg-dark text-muted'}`}
                onClick={() => handleOptionChange(opt as any)}
              >
                <div className="form-check m-0">
                  <input
                    className="form-check-input border-secondary"
                    type="radio"
                    name="cap-option"
                    checked={config.option === opt}
                    readOnly
                  />
                </div>
                <div className="ms-3">
                  <div className="fw-bold font-display fs-5 text-light">{opt}</div>
                  <div className="small">
                    {opt === 'Bordado Al frente' && 'Bordado centralizado principal en frente.'}
                    {opt === 'Bordado Al frente y un costado' && 'Bordado en frente más un parche/diseño en el lateral.'}
                    {opt === 'Bordado Al frente y ambos costados' && 'Bordado en frente más diseños en ambos laterales.'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Modelo de Gorra */}
      <div className="mb-4">
        <label className="form-label text-muted small uppercase fw-bold">Modelo de Gorra:</label>
        <select 
          className="form-select"
          value={config.model}
          onChange={handleModelChange}
        >
          {capModels.map(model => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
      </div>

      {/* 3. Bordado 3D (Relieve) */}
      <div className="mb-4">
        <label className="form-label text-muted small uppercase fw-bold d-block">¿Agregar 3D (Bordado en Relieve)?:</label>
        <p className="text-muted small mb-2">Añade relieve tridimensional a las letras o trazos gruesos (si es factible).</p>
        <div className="btn-group" role="group" aria-label="Bordado 3D Toggle">
          <button 
            type="button" 
            className={`btn btn-sm ${config.add3D ? 'btn-danger' : 'btn-outline-secondary text-light'}`}
            onClick={() => onChange({ ...config, add3D: true })}
          >
            Sí, agregar 3D
          </button>
          <button 
            type="button" 
            className={`btn btn-sm ${!config.add3D ? 'btn-danger' : 'btn-outline-secondary text-light'}`}
            onClick={() => onChange({ ...config, add3D: false })}
          >
            No, bordado plano
          </button>
        </div>
      </div>

      {/* 4. Cantidad */}
      <div className="mb-4">
        <label className="form-label text-muted small uppercase fw-bold">Cantidad de piezas (Mínimo 1pz):</label>
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

      {/* 5. Posiciones y Subida de Archivos */}
      <div className="mb-4">
        <label className="form-label text-muted small uppercase fw-bold d-block">Detalles de Diseño por Posición:</label>

        {/* Especial: Toggle de Costados en caso de "Frente y Un Costado" */}
        {config.option === 'Bordado Al frente y un costado' && (
          <div className="mb-3 p-2 bg-dark rounded text-center border border-secondary">
            <span className="text-muted small d-block mb-2">Selecciona el costado activo:</span>
            <div className="btn-group">
              <button 
                type="button" 
                className={`btn btn-sm ${config.positions['Lado izquierdo']?.active ? 'btn-danger' : 'btn-outline-secondary text-light'}`}
                onClick={() => handleToggleSide('Lado izquierdo')}
              >
                Costado Izquierdo
              </button>
              <button 
                type="button" 
                className={`btn btn-sm ${config.positions['Lado Derecho']?.active ? 'btn-danger' : 'btn-outline-secondary text-light'}`}
                onClick={() => handleToggleSide('Lado Derecho')}
              >
                Costado Derecho
              </button>
            </div>
          </div>
        )}

        {/* Lista de Posiciones Activas */}
        {Object.entries(config.positions)
          .filter(([_, pos]) => pos.active)
          .map(([posName, pos]) => (
            <div key={posName} className="p-3 mb-3 border border-secondary rounded bg-dark">
              <h6 className="font-display text-primary-brand m-0 mb-3 fs-5">{posName}</h6>
              
              <div className="row g-3">
                {/* Técnica */}
                <div className="col-12 col-sm-6">
                  <label className="form-label text-muted small">Técnica:</label>
                  <select
                    className="form-select"
                    value={pos.type}
                    onChange={(e) => updatePositionField(posName, 'type', e.target.value)}
                  >
                    <option value="Bordado">Bordado</option>
                    <option value="TPU">TPU (Vinil Textil para detalles pequeños)</option>
                  </select>
                </div>

                {/* Tamaño Recomendado */}
                <div className="col-12 col-sm-6">
                  <label className="form-label text-muted small">Tamaño Recomendado:</label>
                  <select
                    className="form-select"
                    value={pos.size}
                    onChange={(e) => updatePositionField(posName, 'size', e.target.value)}
                  >
                    <option value="Pequeño">Pequeño (Sutil / Discreto)</option>
                    <option value="Regular">Regular (Estándar de marca)</option>
                    <option value="Grande">Grande (Protagonista)</option>
                  </select>
                </div>

                {/* Subir archivo */}
                <div className="col-12">
                  <label className="form-label text-muted small">Imagen de Referencia (Máx. 10MB, JPEG/PNG):</label>
                  
                  {!pos.filePreview ? (
                    <div className="border border-secondary border-dashed p-3 rounded text-center">
                      <input
                        type="file"
                        id={`file-cap-${posName}`}
                        className="d-none"
                        accept=".jpeg,.jpg,.png"
                        onChange={(e) => handleFileUpload(posName, e)}
                      />
                      <label htmlFor={`file-cap-${posName}`} className="m-0 cursor-pointer text-primary-brand font-display fs-5">
                        <i className="bi bi-cloud-arrow-up-fill me-2"></i>
                        Subir Archivo
                      </label>
                      <p className="text-muted small m-0 mt-1">El archivo se guardará como gorra-{posName.toLowerCase().replace(/\s+/g, '-')}.jpg/png</p>
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

      {/* 6. Detalles Adicionales */}
      <div className="mb-2">
        <label className="form-label text-muted small uppercase fw-bold">Detalles adicionales para tu gorra:</label>
        <textarea
          className="form-control"
          rows={3}
          value={config.additionalDetails}
          onChange={(e) => onChange({ ...config, additionalDetails: e.target.value })}
          placeholder="Especifica el color de la gorra, color de la visera, broche metálico o plástico, y detalles sobre la combinación de hilos..."
        />
      </div>
    </div>
  );
};
