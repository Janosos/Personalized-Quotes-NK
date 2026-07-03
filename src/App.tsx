import React, { useState, useEffect } from 'react';
import type { ClientDetails, GarmentCustomization, PatchCustomization, CapCustomization, ProductType, GarmentPosition, CapPosition } from './types';
import { RopaConfig } from './components/RopaConfig';
import { ParchesConfig } from './components/ParchesConfig';
import { GorrasConfig } from './components/GorrasConfig';
import { Visualizer } from './components/Visualizer';
import { Marquee } from './components/Marquee';
import { generateQuotePDF } from './utils/pdfGenerator';
import { generateQuoteZIP } from './utils/zipGenerator';

export const App: React.FC = () => {
  // Tab/Product Selection
  const [activeProduct, setActiveProduct] = useState<ProductType>('ropa');

  // Currently active position being configured below the visualizer
  const [selectedPosition, setSelectedPosition] = useState<string | null>('Pecho Izquierdo');

  // Client Info State (Marca/Proyecto company field is removed)
  const [clientDetails, setClientDetails] = useState<ClientDetails>({
    name: '',
    phone: '',
    email: ''
  });

  // State: Clothing (Ropa) - Defaulting to DTF and maximum of 2 positions allowed
  const [ropaConfig, setRopaConfig] = useState<GarmentCustomization>({
    model: 'Oversize',
    color: 'Negro',
    quantity: 10,
    positions: {
      'Pecho Izquierdo': { active: true, type: 'Bordado', size: '10x10', file: null, filePreview: '' }
    },
    additionalDetails: ''
  });

  // State: Patches (Parches)
  const [patchConfig, setPatchConfig] = useState<PatchCustomization>({
    shape: 'Rectangular',
    width: '8.5',
    height: '5.0',
    quantity: 50,
    file: null,
    filePreview: '',
    additionalDetails: ''
  });

  // State: Caps (Gorras)
  const [capConfig, setCapConfig] = useState<CapCustomization>({
    option: 'Bordado Al frente',
    model: 'Snapback (Visera plana)',
    quantity: 20,
    add3D: true,
    positions: {
      'Enfrente': { active: true, type: 'Bordado', size: 'Regular', file: null, filePreview: '' }
    },
    additionalDetails: ''
  });

  // Reset selectedPosition when product tab changes
  useEffect(() => {
    if (activeProduct === 'ropa') {
      setSelectedPosition('Pecho Izquierdo');
    } else if (activeProduct === 'gorras') {
      setSelectedPosition('Enfrente');
    } else {
      setSelectedPosition(null);
    }
  }, [activeProduct]);

  // Shake effect for validation alerts
  const [isSubmitShaking, setIsSubmitShaking] = useState(false);

  // Form Validation
  const validateForm = (action: 'download' | 'whatsapp') => {
    if (!clientDetails.name.trim()) {
      alert('Por favor, ingresa tu nombre en la sección de datos del cliente.');
      return false;
    }
    if (!clientDetails.phone.trim()) {
      alert('Por favor, ingresa tu teléfono en la sección de datos del cliente.');
      return false;
    }

    if (activeProduct === 'ropa') {
      const activePositions = Object.values(ropaConfig.positions).filter(p => p.active);
      if (activePositions.length === 0) {
        alert('Debes seleccionar al menos una posición de diseño para personalizar tu prenda.');
        return false;
      }
      
      const missingFiles = activePositions.filter(p => !p.file);
      if (missingFiles.length > 0 && action === 'download') {
        const confirmProceed = window.confirm(
          `Tienes ${missingFiles.length} área(s) sin diseño cargado. ¿Deseas descargar la cotización de todas formas?`
        );
        if (!confirmProceed) return false;
      }
    } else if (activeProduct === 'gorras') {
      const activePositions = Object.values(capConfig.positions).filter(p => p.active);
      if (activePositions.length === 0) {
        alert('Debes seleccionar al menos una posición de diseño para tu gorra.');
        return false;
      }
      const missingFiles = activePositions.filter(p => !p.file);
      if (missingFiles.length > 0 && action === 'download') {
        const confirmProceed = window.confirm(
          `Tienes ${missingFiles.length} área(s) de gorra sin diseño cargado. ¿Deseas descargar la cotización de todas formas?`
        );
        if (!confirmProceed) return false;
      }
    } else if (activeProduct === 'parches') {
      if (!patchConfig.file && action === 'download') {
        const confirmProceed = window.confirm(
          'No has cargado ningún diseño para el parche. ¿Deseas descargar la cotización de todas formas?'
        );
        if (!confirmProceed) return false;
      }
    }

    return true;
  };

  // Restricts to maximum of 2 positions
  const handlePositionToggle = (position: string) => {
    if (activeProduct === 'ropa') {
      const isCurrentlyActive = ropaConfig.positions[position]?.active;
      const activeCount = Object.values(ropaConfig.positions).filter(p => p.active).length;

      if (!isCurrentlyActive && activeCount >= 2) {
        alert('Solo es posible personalizar un máximo de 2 áreas por prenda (Bordado y Bordado, Bordado y DTF, DTF y Bordado, o DTF y DTF).');
        return;
      }

      const updatedPositions = { ...ropaConfig.positions };
      if (isCurrentlyActive) {
        updatedPositions[position] = { ...updatedPositions[position], active: false };
      } else {
        updatedPositions[position] = {
          active: true,
          type: 'DTF',
          size: '10x10',
          file: null,
          filePreview: ''
        };
      }
      setRopaConfig({ ...ropaConfig, positions: updatedPositions });
    } else if (activeProduct === 'gorras') {
      if (capConfig.option === 'Bordado Al frente') {
        alert('En esta opción, solo puedes bordar en el frente.');
      } else if (capConfig.option === 'Bordado Al frente y un costado') {
        if (position === 'Enfrente') {
          alert('El bordado al frente es requerido en este paquete.');
          return;
        }
        const updatedPositions = { ...capConfig.positions };
        if (position === 'Lado izquierdo') {
          updatedPositions['Lado izquierdo'].active = true;
          updatedPositions['Lado Derecho'].active = false;
        } else if (position === 'Lado Derecho') {
          updatedPositions['Lado izquierdo'].active = false;
          updatedPositions['Lado Derecho'].active = true;
        }
        setCapConfig({ ...capConfig, positions: updatedPositions });
      } else if (capConfig.option === 'Bordado Al frente y ambos costados') {
        alert('En esta opción, se personalizan el frente y ambos costados de forma predeterminada.');
      }
    }
  };

  // Helper updates for active positions
  const updateGarmentPositionField = (posName: string, field: keyof GarmentPosition, value: any) => {
    const updatedPositions = { ...ropaConfig.positions };
    updatedPositions[posName] = {
      ...updatedPositions[posName],
      [field]: value
    };
    setRopaConfig({ ...ropaConfig, positions: updatedPositions });
  };

  const updateCapPositionField = (posName: string, field: keyof CapPosition, value: any) => {
    const updatedPositions = { ...capConfig.positions };
    updatedPositions[posName] = {
      ...updatedPositions[posName],
      [field]: value
    };
    setCapConfig({ ...capConfig, positions: updatedPositions });
  };

  // Image Upload handler inside main coordinator
  const handlePositionFileUpload = (posName: string, e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Convert file to base64 preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (activeProduct === 'ropa') {
        updateGarmentPositionField(posName, 'file', file);
        updateGarmentPositionField(posName, 'filePreview', reader.result as string);
      } else if (activeProduct === 'gorras') {
        updateCapPositionField(posName, 'file', file);
        updateCapPositionField(posName, 'filePreview', reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const removePositionFile = (posName: string) => {
    if (activeProduct === 'ropa') {
      updateGarmentPositionField(posName, 'file', null);
      updateGarmentPositionField(posName, 'filePreview', '');
    } else if (activeProduct === 'gorras') {
      updateCapPositionField(posName, 'file', null);
      updateCapPositionField(posName, 'filePreview', '');
    }
  };

  // Action: Generate PDF & ZIP
  const handleDownloadQuote = async () => {
    if (!validateForm('download')) {
      triggerSubmitShake();
      return;
    }

    try {
      const doc = generateQuotePDF(
        clientDetails,
        activeProduct,
        ropaConfig,
        patchConfig,
        capConfig
      );

      await generateQuoteZIP(
        clientDetails.name,
        doc,
        activeProduct,
        ropaConfig,
        patchConfig,
        capConfig
      );
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al generar la cotización en ZIP. Inténtalo de nuevo.');
    }
  };

  // Action: Send WhatsApp (Runs download zip asynchronously and launches WhatsApp immediately synchronously to avoid browser block!)
  const handleWhatsAppQuote = () => {
    if (!validateForm('whatsapp')) {
      triggerSubmitShake();
      return;
    }

    // Auto-generate and download ZIP file concurrently (without await to bypass popup blocking)
    try {
      const doc = generateQuotePDF(
        clientDetails,
        activeProduct,
        ropaConfig,
        patchConfig,
        capConfig
      );

      generateQuoteZIP(
        clientDetails.name,
        doc,
        activeProduct,
        ropaConfig,
        patchConfig,
        capConfig
      ).catch(e => console.error("Error generating ZIP:", e));
    } catch (err) {
      console.error('Error auto-generating ZIP for WhatsApp:', err);
    }

    const number = '526622455087'; // Updated destination phone number
    
    let summaryText = '';
    if (activeProduct === 'ropa') {
      const activePositions = Object.keys(ropaConfig.positions)
        .filter(k => ropaConfig.positions[k].active)
        .map(k => `${k} (${ropaConfig.positions[k].type})`)
        .join(', ');
      summaryText = `Ropa (${ropaConfig.model})\n- Color: ${ropaConfig.color}\n- Cantidad: ${ropaConfig.quantity}pz\n- Zonas: ${activePositions}`;
    } else if (activeProduct === 'parches') {
      summaryText = `Parches (${patchConfig.shape})\n- Medidas: ${patchConfig.width}x${patchConfig.height}cm\n- Cantidad: ${patchConfig.quantity}pz`;
    } else if (activeProduct === 'gorras') {
      const activePositions = Object.keys(capConfig.positions)
        .filter(k => capConfig.positions[k].active)
        .map(k => `${k} (${capConfig.positions[k].type})`)
        .join(', ');
      summaryText = `Gorras (${capConfig.model})\n- Paquete: ${capConfig.option}\n- Cantidad: ${capConfig.quantity}pz\n- Zonas: ${activePositions}\n- Bordado 3D: ${capConfig.add3D ? 'Sí' : 'No'}`;
    }

    const message = `¡Hola Nakama! Me gustaría solicitar la cotización formal de mis personalizados con los siguientes datos:\n\n` +
      `*Cliente:* ${clientDetails.name}\n` +
      `*Teléfono:* ${clientDetails.phone}\n` +
      `*Email:* ${clientDetails.email || 'N/A'}\n\n` +
      `*Detalle de Producto:*\n${summaryText}\n\n` +
      `_Se ha descargado automáticamente el archivo ZIP con mi cotización y diseños. Se lo adjunto a continuación en este chat para revisión técnica._`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${number}?text=${encoded}`, '_blank');
  };

  const triggerSubmitShake = () => {
    setIsSubmitShaking(true);
    setTimeout(() => setIsSubmitShaking(false), 500);
  };

  const getActivePositionsArray = (): string[] => {
    if (activeProduct === 'ropa') {
      return Object.entries(ropaConfig.positions)
        .filter(([_, p]) => p.active)
        .map(([name]) => name);
    } else if (activeProduct === 'gorras') {
      return Object.entries(capConfig.positions)
        .filter(([_, p]) => p.active)
        .map(([name]) => name);
    }
    return [];
  };

  // Render individual position configuration sub-form immediately below visualizer
  const renderActivePositionEditor = () => {
    if (activeProduct === 'parches' || !selectedPosition) return null;

    let isActive = false;
    let technique = 'Bordado';
    let sizeValue = '';
    let previewUrl = '';
    let uploadedFile: File | null = null;

    if (activeProduct === 'ropa') {
      const pos = ropaConfig.positions[selectedPosition];
      isActive = !!pos?.active;
      technique = pos?.type || 'DTF';
      sizeValue = pos?.size || '';
      previewUrl = pos?.filePreview || '';
      uploadedFile = pos?.file || null;
    } else if (activeProduct === 'gorras') {
      const pos = capConfig.positions[selectedPosition];
      isActive = !!pos?.active;
      technique = pos?.type || 'Bordado';
      sizeValue = pos?.size || 'Regular';
      previewUrl = pos?.filePreview || '';
      uploadedFile = pos?.file || null;
    }

    return (
      <div className="custom-card mb-4 bg-white border border-danger border-opacity-25" style={{ scrollMarginTop: '20px' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="font-display text-primary-brand m-0 fs-4">
            <i className="bi bi-gear-wide-connected me-2"></i>
            Configurar Área: <span className="text-dark">{selectedPosition}</span>
          </h4>
          <div className="form-check form-switch m-0">
            <input
              className="form-check-input"
              type="checkbox"
              id="activate-position-switch"
              checked={isActive}
              onChange={() => handlePositionToggle(selectedPosition)}
              style={{ cursor: 'pointer', scale: '1.2' }}
            />
            <label className="form-check-label text-muted small ms-2" htmlFor="activate-position-switch" style={{ cursor: 'pointer' }}>
              {isActive ? 'Área Activa' : 'Área Inactiva'}
            </label>
          </div>
        </div>

        {isActive ? (
          <div className="row g-3 animate-fade-in">
            {/* 1. Técnica */}
            <div className="col-12 col-sm-6">
              <label className="form-label text-muted small uppercase fw-bold">Técnica de Personalizado:</label>
              {activeProduct === 'ropa' ? (
                <select
                  className="form-select"
                  value={technique}
                  onChange={(e) => updateGarmentPositionField(selectedPosition, 'type', e.target.value)}
                >
                  <option value="DTF">DTF (Estampado digital a todo color)</option>
                  <option value="Bordado">Bordado</option>
                </select>
              ) : (
                <select
                  className="form-select"
                  value={technique}
                  onChange={(e) => updateCapPositionField(selectedPosition, 'type', e.target.value)}
                >
                  <option value="Bordado">Bordado</option>
                  <option value="TPU">TPU (Vinil Textil para detalles pequeños)</option>
                </select>
              )}
            </div>

            {/* 2. Medidas / Tamaños */}
            <div className="col-12 col-sm-6">
              <label className="form-label text-muted small uppercase fw-bold">Medidas Estimadas:</label>
              {activeProduct === 'ropa' ? (
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={sizeValue}
                    onChange={(e) => updateGarmentPositionField(selectedPosition, 'size', e.target.value)}
                    placeholder="Ej. 10x10 en CM"
                  />
                  <span className="input-group-text bg-light text-muted border-light-subtle">cm</span>
                </div>
              ) : (
                <select
                  className="form-select"
                  value={sizeValue}
                  onChange={(e) => updateCapPositionField(selectedPosition, 'size', e.target.value)}
                >
                  <option value="Pequeño">Pequeño (Discreto)</option>
                  <option value="Regular">Regular (Normal)</option>
                  <option value="Grande">Grande (Llamativo)</option>
                </select>
              )}
            </div>

            {/* 3. Cargar Archivos de Referencia */}
            <div className="col-12 mt-3">
              <label className="form-label text-muted small uppercase fw-bold">Subir Diseño de Referencia (Máx. 10MB, JPG/PNG):</label>
              
              {!previewUrl ? (
                <div className="border border-secondary border-dashed p-4 rounded text-center bg-light">
                  <input
                    type="file"
                    id={`file-upload-coord-${selectedPosition}`}
                    className="d-none"
                    accept=".jpeg,.jpg,.png"
                    onChange={(e) => handlePositionFileUpload(selectedPosition, e)}
                  />
                  <label htmlFor={`file-upload-coord-${selectedPosition}`} className="m-0 cursor-pointer text-primary-brand font-display fs-5">
                    <i className="bi bi-cloud-arrow-up-fill me-2 fs-4"></i>
                    Seleccionar Archivo de Referencia
                  </label>
                  <p className="text-muted small m-0 mt-1">
                    El archivo se renombrará automáticamente a: <strong>{activeProduct}_{selectedPosition.toLowerCase().replace(/\s+/g, '-')}.jpg/png</strong>
                  </p>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-3 p-3 bg-light rounded border border-light-subtle">
                  <img 
                    src={previewUrl} 
                    alt="preview" 
                    className="object-fit-cover rounded border border-secondary bg-white"
                    style={{ width: '80px', height: '80px' }}
                  />
                  <div className="flex-grow-1 overflow-hidden">
                    <p className="small m-0 text-truncate text-dark fw-bold">{uploadedFile?.name}</p>
                    <p className="small m-0 text-muted">{(uploadedFile!.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-outline-danger"
                    onClick={() => removePositionFile(selectedPosition)}
                  >
                    <i className="bi bi-trash me-2"></i>Eliminar Diseño
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center p-4 bg-light rounded border border-dashed border-secondary">
            <p className="text-muted mb-3 fs-6">
              El área <strong>"{selectedPosition}"</strong> está actualmente inactiva. 
              Actívala para agregar tu diseño y técnica correspondientes.
            </p>
            <button
              type="button"
              className="btn btn-danger font-display px-4 py-2 text-white border-0 bg-primary"
              onClick={() => handlePositionToggle(selectedPosition)}
            >
              <i className="bi bi-plus-circle-fill me-2"></i>
              Activar {selectedPosition}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-light text-dark pb-5">
      {/* 1. Header */}
      <header className="py-4 border-bottom border-light-subtle bg-white">
        <div className="container d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
          <div className="text-center text-sm-start">
            <h1 className="font-display text-dark display-4 fw-bold m-0 tracking-wider">
              NAKAMA <span className="text-primary-brand font-display">CUSTOMS</span>
            </h1>
            <p className="text-muted small m-0 uppercase tracking-widest font-display">LABORATORIO DE PRENDAS PERSONALIZADAS</p>
          </div>
          <div>
            <span className="badge bg-danger rounded-pill px-3 py-2 font-display fs-6 tracking-wide">
              MÓDULO DE COTIZACIÓN V1.2
            </span>
          </div>
        </div>
      </header>

      {/* 2. Marquee Ticker */}
      <Marquee />

      {/* 3. Main Container Workspace */}
      <div className="container mt-5">
        <div className="row g-4">
          
          {/* COLUMNA IZQUIERDA: CONFIGURADOR + VISUALIZADOR */}
          <div className="col-12 col-lg-8">
            
            {/* TABS DE PRODUCTO */}
            <div className="custom-card mb-4 bg-white border border-light-subtle">
              <h5 className="text-muted small uppercase fw-bold mb-3">Paso 1: Selecciona el tipo de producto</h5>
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`custom-tab-btn flex-grow-1 flex-sm-grow-0 ${activeProduct === 'ropa' ? 'active' : ''}`}
                  onClick={() => setActiveProduct('ropa')}
                >
                  <i className="bi bi-tag-fill me-2"></i> Ropa / Playeras / Hoodies
                </button>
                <button
                  type="button"
                  className={`custom-tab-btn flex-grow-1 flex-sm-grow-0 ${activeProduct === 'parches' ? 'active' : ''}`}
                  onClick={() => setActiveProduct('parches')}
                >
                  <i className="bi bi-shield-fill me-2"></i> Parches Bordados
                </button>
                <button
                  type="button"
                  className={`custom-tab-btn flex-grow-1 flex-sm-grow-0 ${activeProduct === 'gorras' ? 'active' : ''}`}
                  onClick={() => setActiveProduct('gorras')}
                >
                  <i className="bi bi-capslock-fill me-2"></i> Gorras de Marca
                </button>
              </div>
            </div>

            {/* VISUALIZADOR INTERACTIVO */}
            <Visualizer
              productType={activeProduct}
              selectedPositions={getActivePositionsArray()}
              onPositionToggle={handlePositionToggle}
              selectedEditingPosition={selectedPosition}
              onSelectPositionForEditing={setSelectedPosition}
              patchShape={patchConfig.shape}
            />

            {/* PANEL DE CONFIGURACIÓN DE ÁREA INMEDIATAMENTE ABAJO */}
            {renderActivePositionEditor()}

            {/* FORMULARIO ESPECÍFICO DE CONFIGURACIÓN GENERAL */}
            {activeProduct === 'ropa' && (
              <RopaConfig config={ropaConfig} onChange={setRopaConfig} />
            )}
            {activeProduct === 'parches' && (
              <ParchesConfig config={patchConfig} onChange={setPatchConfig} />
            )}
            {activeProduct === 'gorras' && (
              <GorrasConfig config={capConfig} onChange={setCapConfig} />
            )}

          </div>

          {/* COLUMNA DERECHA: DATOS DEL CLIENTE + RESUMEN STICKY */}
          <div className="col-12 col-lg-4">
            <div className="position-sticky" style={{ top: '24px' }}>
              
              {/* DATOS DEL CLIENTE */}
              <div className="custom-card bg-white border border-light-subtle mb-4">
                <h4 className="font-display text-primary-brand mb-3">
                  <i className="bi bi-person-lines-fill me-2"></i>
                  Datos del Cliente
                </h4>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label text-muted small uppercase fw-bold">Nombre Completo *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={clientDetails.name}
                      onChange={(e) => setClientDetails({ ...clientDetails, name: e.target.value })}
                      placeholder="Tu nombre o contacto"
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted small uppercase fw-bold">Teléfono de Contacto (WhatsApp) *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={clientDetails.phone}
                      onChange={(e) => setClientDetails({ ...clientDetails, phone: e.target.value })}
                      placeholder="Ej. +52 662 123 4567"
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted small uppercase fw-bold">Correo Electrónico</label>
                    <input
                      type="email"
                      className="form-control"
                      value={clientDetails.email}
                      onChange={(e) => setClientDetails({ ...clientDetails, email: e.target.value })}
                      placeholder="ejemplo@correo.com"
                    />
                  </div>
                </div>
              </div>

              {/* RESUMEN DE COTIZACIÓN */}
              <div className="custom-card bg-white border border-light-subtle">
                <h4 className="font-display text-primary-brand mb-3">
                  <i className="bi bi-file-earmark-bar-graph-fill me-2"></i>
                  Resumen del Pedido
                </h4>
                
                {/* Detalles de resumen */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between border-bottom border-light-subtle py-2">
                    <span className="text-muted small">Producto:</span>
                    <span className="fw-semibold text-dark uppercase">
                      {activeProduct === 'ropa' ? 'Prendas Textiles' : activeProduct === 'parches' ? 'Parches Bordados' : 'Gorras'}
                    </span>
                  </div>

                  {activeProduct === 'ropa' && (
                    <>
                      <div className="d-flex justify-content-between border-bottom border-light-subtle py-2">
                        <span className="text-muted small">Modelo:</span>
                        <span className="text-dark text-truncate" style={{ maxWidth: '200px' }}>{ropaConfig.model}</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom border-light-subtle py-2">
                        <span className="text-muted small">Color de Prenda:</span>
                        <span className="text-dark">{ropaConfig.color}</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom border-light-subtle py-2">
                        <span className="text-muted small">Cantidad:</span>
                        <span className="text-primary-brand fw-bold">{ropaConfig.quantity} pz(s)</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom border-light-subtle py-2">
                        <span className="text-muted small">Áreas a personalizar:</span>
                        <span className="text-dark fw-semibold">
                          {Object.values(ropaConfig.positions).filter(p => p.active).length} área(s)
                        </span>
                      </div>
                    </>
                  )}

                  {activeProduct === 'parches' && (
                    <>
                      <div className="d-flex justify-content-between border-bottom border-light-subtle py-2">
                        <span className="text-muted small">Forma:</span>
                        <span className="text-dark">{patchConfig.shape}</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom border-light-subtle py-2">
                        <span className="text-muted small">Medidas:</span>
                        <span className="text-dark">{patchConfig.width || '-'} x {patchConfig.height || '-'} cm</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom border-light-subtle py-2">
                        <span className="text-muted small">Cantidad:</span>
                        <span className="text-primary-brand fw-bold">{patchConfig.quantity} pz(s)</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom border-light-subtle py-2">
                        <span className="text-muted small">Diseño cargado:</span>
                        <span className={patchConfig.file ? "text-success fw-bold" : "text-warning"}>
                          {patchConfig.file ? 'Sí' : 'No'}
                        </span>
                      </div>
                    </>
                  )}

                  {activeProduct === 'gorras' && (
                    <>
                      <div className="d-flex justify-content-between border-bottom border-light-subtle py-2">
                        <span className="text-muted small">Modelo:</span>
                        <span className="text-dark">{capConfig.model}</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom border-light-subtle py-2">
                        <span className="text-muted small">Paquete:</span>
                        <span className="text-dark text-truncate" style={{ maxWidth: '180px' }}>{capConfig.option}</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom border-light-subtle py-2">
                        <span className="text-muted small">Cantidad:</span>
                        <span className="text-primary-brand fw-bold">{capConfig.quantity} pz(s)</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom border-light-subtle py-2">
                        <span className="text-muted small">Áreas a personalizar:</span>
                        <span className="text-dark fw-semibold">
                          {Object.values(capConfig.positions).filter(p => p.active).length} área(s)
                        </span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom border-light-subtle py-2">
                        <span className="text-muted small">Bordado en 3D:</span>
                        <span className="text-dark">{capConfig.add3D ? 'Sí' : 'No'}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* WhatsApp Security Alert Note */}
                <div className="alert alert-info py-2 small mb-3 border-0 bg-light text-dark">
                  <i className="bi bi-info-circle-fill me-2 text-primary-brand"></i>
                  <strong>Nota de Envío:</strong> Por limitaciones de seguridad de WhatsApp, los navegadores no pueden enviar archivos directamente. Al hacer clic abajo, se descargará automáticamente el ZIP en tu dispositivo y se abrirá el chat para que lo arrastres y envíes.
                </div>

                {/* ACCIONES */}
                <div className="d-grid gap-3">
                  <button
                    type="button"
                    className={`btn btn-primary py-3 fs-5 ${isSubmitShaking ? 'btn-shake' : ''}`}
                    onClick={handleDownloadQuote}
                  >
                    <i className="bi bi-file-earmark-zip-fill me-2"></i>
                    Descargar Cotización (PDF + ZIP)
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-success py-3 fs-5 font-display text-white border-success"
                    style={{ backgroundColor: '#25D366' }}
                    onClick={handleWhatsAppQuote}
                  >
                    <i className="bi bi-whatsapp me-2"></i>
                    Solicitar vía WhatsApp
                  </button>
                </div>

                <p className="text-muted small text-center m-0 mt-3 font-display tracking-wide uppercase">
                  Revisamos y contestamos en menos de 2 horas hábiles
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
export default App;
