import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { GarmentCustomization, PatchCustomization, CapCustomization } from '../types';

// Helper to normalize Spanish strings for filenames
function normalizeFilename(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/[^a-z0-9_-]/g, ''); // Remove special characters
}

export async function generateQuoteZIP(
  clientName: string,
  pdfDoc: jsPDF,
  productType: 'ropa' | 'parches' | 'gorras',
  ropaConfig: GarmentCustomization,
  patchConfig: PatchCustomization,
  capConfig: CapCustomization
): Promise<void> {
  const zip = new JSZip();
  const folderName = `diseños_referencia`;
  const designFolder = zip.folder(folderName);

  // 1. Add the PDF document
  const pdfBlob = pdfDoc.output('blob');
  const sanitizedClientName = normalizeFilename(clientName || 'cliente');
  const pdfFilename = `cotizacion_nakama_${sanitizedClientName}.pdf`;
  zip.file(pdfFilename, pdfBlob);

  // 2. Scan and add files
  if (productType === 'ropa') {
    Object.entries(ropaConfig.positions).forEach(([posName, pos]) => {
      if (pos.active && pos.file) {
        const fileExt = pos.file.name.substring(pos.file.name.lastIndexOf('.')) || '.png';
        const normalizedPos = normalizeFilename(posName);
        const newFilename = `ropa_${normalizedPos}${fileExt}`;
        if (designFolder) {
          designFolder.file(newFilename, pos.file);
        }
      }
    });
  } else if (productType === 'parches') {
    if (patchConfig.file) {
      const fileExt = patchConfig.file.name.substring(patchConfig.file.name.lastIndexOf('.')) || '.png';
      const shapeNormalized = normalizeFilename(patchConfig.shape);
      const newFilename = `parche_${shapeNormalized}${fileExt}`;
      if (designFolder) {
        designFolder.file(newFilename, patchConfig.file);
      }
    }
  } else if (productType === 'gorras') {
    Object.entries(capConfig.positions).forEach(([posName, pos]) => {
      if (pos.active && pos.file) {
        const fileExt = pos.file.name.substring(pos.file.name.lastIndexOf('.')) || '.png';
        const normalizedPos = normalizeFilename(posName);
        const newFilename = `gorra_${normalizedPos}${fileExt}`;
        if (designFolder) {
          designFolder.file(newFilename, pos.file);
        }
      }
    });
  }

  // 3. Generate and trigger download
  const zipContent = await zip.generateAsync({ type: 'blob' });
  const zipFilename = `cotizacion_nakama_${sanitizedClientName}.zip`;
  saveAs(zipContent, zipFilename);
}
