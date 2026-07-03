import React, { useState } from 'react';
import type { ClientDetails, GarmentCustomization, PatchCustomization, CapCustomization, ProductType } from './types';
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

  // Client Info State
  const [clientDetails, setClientDetails] = useState<ClientDetails>({
    name: '',
    phone: '',
    email: '',
    company: ''
  });

  // State: Clothing (Ropa)
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

    // Check if at least one design is selected (for Ropa and Gorras)
    if (activeProduct === 'ropa') {
      const activePositions = Object.values(ropaConfig.positions).filter(p => p.active);
      if (activePositions.length === 0) {
        alert('Debes seleccionar al menos una posición de diseño para personalizar tu prenda.');
        return false;
      }
      
      // Warning for empty files but allow proceed
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

  const handlePositionToggle = (position: string) => {
    if (activeProduct === 'ropa') {
      const isCurrentlyActive = ropaConfig.positions[position]?.active;
      const updatedPositions = { ...ropaConfig.positions };
      if (isCurrentlyActive) {
        updatedPositions[position] = { ...updatedPositions[position], active: false };
      } else {
        updatedPositions[position] = {
          active: true,
          type: 'Estampado',
          size: '15x15',
          file: null,
          filePreview: ''
        };
      }
      setRopaConfig({ ...ropaConfig, positions: updatedPositions });
    } else if (activeProduct === 'gorras') {
      // In gorras position activation depends on option:
      if (capConfig.option === 'Bordado Al frente') {
        alert('En esta opción, solo puedes bordar en el frente.');
      } else if (capConfig.option === 'Bordado Al frente y un costado') {
        if (position === 'Enfrente') {
          alert('El bordado al frente es requerido en este paquete.');
          return;
        }
        // Swap costados
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

  // Action: Send WhatsApp
  const handleWhatsAppQuote = () => {
    if (!validateForm('whatsapp')) {
      triggerSubmitShake();
      return;
    }

    const number = '5219999999999'; // Brand contact placeholder number (replace as needed)
    
    let summaryText = '';
    if (activeProduct === 'ropa') {
      const activePositions = Object.keys(ropaConfig.positions).filter(k => ropaConfig.positions[k].active).join(', ');
      summaryText = `Ropa (${ropaConfig.model})\n- Color: ${ropaConfig.color}\n- Cantidad: ${ropaConfig.quantity}pz\n- Zonas: ${activePositions}`;
    } else if (activeProduct === 'parches') {
      summaryText = `Parches (${patchConfig.shape})\n- Medidas: ${patchConfig.width}x${patchConfig.height}cm\n- Cantidad: ${patchConfig.quantity}pz`;
    } else if (activeProduct === 'gorras') {
      const activePositions = Object.keys(capConfig.positions).filter(k => capConfig.positions[k].active).join(', ');
      summaryText = `Gorras (${capConfig.model})\n- Paquete: ${capConfig.option}\n- Cantidad: ${capConfig.quantity}pz\n- Zonas: ${activePositions}\n- Bordado 3D: ${capConfig.add3D ? 'Sí' : 'No'}`;
    }

    const message = `¡Hola Nakama! Me gustaría solicitar la cotización formal de mis personalizados con los siguientes datos:\n\n` +
      `*Cliente:* ${clientDetails.name}\n` +
      `*Teléfono:* ${clientDetails.phone}\n` +
      `*Email:* ${clientDetails.email || 'N/A'}\n` +
      `*Proyecto/Empresa:* ${clientDetails.company || 'N/A'}\n\n` +
      `*Detalle de Producto:*\n${summaryText}\n\n` +
      `_Acabo de descargar la cotización en formato PDF/ZIP. Les enviaré el archivo por este chat para verificar los diseños de referencia._`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${number}?text=${encoded}`, '_blank');
  };

  const triggerSubmitShake = () => {
    setIsSubmitShaking(true);
    setTimeout(() => setIsSubmitShaking(false), 500);
  };

  // Helpers to fetch position count or active items
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

  return (
    <div className="min-h-screen bg-black text-light pb-5">
      {/* 1. Header */}
      <header className="py-4 border-bottom border-secondary bg-black">
        <div className="container d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
          <div className="text-center text-sm-start">
            <h1 className="font-display text-white display-4 fw-bold m-0 tracking-wider">
              NAKAMA <span className="text-primary-brand font-display">CUSTOMS</span>
            </h1>
            <p className="text-muted small m-0 uppercase tracking-widest font-display">LABORATORIO DE PRENDAS PERSONALIZADAS</p>
          </div>
          <div>
            <span className="badge bg-danger rounded-pill px-3 py-2 font-display fs-6 tracking-wide">
              MÓDULO DE COTIZACIÓN V1.0
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
            <div className="custom-card mb-4 bg-black border border-primary-subtle-10">
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
              patchShape={patchConfig.shape}
            />

            {/* FORMULARIO ESPECÍFICO DE CONFIGURACIÓN */}
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
              <div className="custom-card bg-black border border-primary-subtle-10 mb-4">
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
                      placeholder="Ej. +52 999 123 4567"
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
                  <div className="col-12">
                    <label className="form-label text-muted small uppercase fw-bold">Marca / Proyecto</label>
                    <input
                      type="text"
                      className="form-control"
                      value={clientDetails.company}
                      onChange={(e) => setClientDetails({ ...clientDetails, company: e.target.value })}
                      placeholder="Nombre de tu marca de ropa"
                    />
                  </div>
                </div>
              </div>

              {/* RESUMEN DE COTIZACIÓN */}
              <div className="custom-card bg-black border border-primary-subtle-10">
                <h4 className="font-display text-primary-brand mb-3">
                  <i className="bi bi-file-earmark-bar-graph-fill me-2"></i>
                  Resumen del Pedido
                </h4>
                
                {/* Detalles de resumen */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between border-bottom border-secondary py-2">
                    <span className="text-muted small">Producto:</span>
                    <span className="fw-semibold text-light uppercase">
                      {activeProduct === 'ropa' ? 'Prendas Textiles' : activeProduct === 'parches' ? 'Parches Bordados' : 'Gorras'}
                    </span>
                  </div>

                  {activeProduct === 'ropa' && (
                    <>
                      <div className="d-flex justify-content-between border-bottom border-secondary py-2">
                        <span className="text-muted small">Modelo:</span>
                        <span className="text-light text-truncate" style={{ maxWidth: '200px' }}>{ropaConfig.model}</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom border-secondary py-2">
                        <span className="text-muted small">Color de Prenda:</span>
                        <span className="text-light">{ropaConfig.color}</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom border-secondary py-2">
                        <span className="text-muted small">Cantidad:</span>
                        <span className="text-primary-brand fw-bold">{ropaConfig.quantity} pz(s)</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom border-secondary py-2">
                        <span className="text-muted small">Áreas a personalizar:</span>
                        <span className="text-light fw-semibold">
                          {Object.values(ropaConfig.positions).filter(p => p.active).length} área(s)
                        </span>
                      </div>
                    </>
                  )}

                  {activeProduct === 'parches' && (
                    <>
                      <div className="d-flex justify-content-between border-bottom border-secondary py-2">
                        <span className="text-muted small">Forma:</span>
                        <span className="text-light">{patchConfig.shape}</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom border-secondary py-2">
                        <span className="text-muted small">Medidas:</span>
                        <span className="text-light">{patchConfig.width || '-'} x {patchConfig.height || '-'} cm</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom border-secondary py-2">
                        <span className="text-muted small">Cantidad:</span>
                        <span className="text-primary-brand fw-bold">{patchConfig.quantity} pz(s)</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom border-secondary py-2">
                        <span className="text-muted small">Diseño cargado:</span>
                        <span className={patchConfig.file ? "text-success fw-bold" : "text-warning"}>
                          {patchConfig.file ? 'Sí' : 'No'}
                        </span>
                      </div>
                    </>
                  )}

                  {activeProduct === 'gorras' && (
                    <>
                      <div className="d-flex justify-content-between border-bottom border-secondary py-2">
                        <span className="text-muted small">Modelo:</span>
                        <span className="text-light">{capConfig.model}</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom border-secondary py-2">
                        <span className="text-muted small">Paquete:</span>
                        <span className="text-light text-truncate" style={{ maxWidth: '180px' }}>{capConfig.option}</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom border-secondary py-2">
                        <span className="text-muted small">Cantidad:</span>
                        <span className="text-primary-brand fw-bold">{capConfig.quantity} pz(s)</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom border-secondary py-2">
                        <span className="text-muted small">Áreas a personalizar:</span>
                        <span className="text-light fw-semibold">
                          {Object.values(capConfig.positions).filter(p => p.active).length} área(s)
                        </span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom border-secondary py-2">
                        <span className="text-muted small">Bordado en 3D:</span>
                        <span className="text-light">{capConfig.add3D ? 'Sí' : 'No'}</span>
                      </div>
                    </>
                  )}
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
