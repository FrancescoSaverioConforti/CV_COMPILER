import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Estrae testo dal PDF Europass ricostruendo le coppie label|valore
 * dalla struttura a due colonne del formato Europass.
 * 
 * Il PDF Europass ha una linea verticale che separa:
 *   - Colonna SINISTRA (etichette): x tipicamente 60-190
 *   - Colonna DESTRA (valori): x tipicamente 210-500
 */
export async function importPDF_OCR(file) {
  const typedArray = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;

  let allItems = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    for (const item of content.items) {
      if (!item.str || !item.str.trim()) continue;
      allItems.push({
        page: pageNum,
        x: item.transform[4],
        y: item.transform[5],
        text: item.str.trim(),
      });
    }
  }

  // Raggruppa per Y (stessa riga = Y entro 3px)
  const rows = [];
  for (const item of allItems) {
    const existing = rows.find(r =>
      r.page === item.page && Math.abs(r.y - item.y) <= 3
    );
    if (existing) {
      existing.items.push(item);
    } else {
      rows.push({ page: item.page, y: item.y, items: [item] });
    }
  }

  // Ordina le righe: per pagina, poi Y decrescente (pdfjs ha Y dal basso)
  rows.sort((a, b) => {
    if (a.page !== b.page) return a.page - b.page;
    return b.y - a.y;
  });

  // Per ogni riga, determina cosa è label e cosa è valore
  // La soglia X la calcoliamo dinamicamente: troviamo il gap nella distribuzione X
  const allX = allItems.map(i => i.x).sort((a, b) => a - b);
  // Cerca il gap più grande tra 150 e 300 (zona della linea verticale Europass)
  let threshold = 210; // default
  for (let i = 0; i < allX.length - 1; i++) {
    if (allX[i] > 150 && allX[i] < 300 && allX[i+1] - allX[i] > 15) {
      threshold = (allX[i] + allX[i+1]) / 2;
      break;
    }
  }
  console.log("Soglia colonne X:", threshold);

  // Costruisci testo strutturato: "label | valore"
  let result = "";
  for (const row of rows) {
    const leftItems = row.items.filter(i => i.x < threshold).sort((a, b) => a.x - b.x);
    const rightItems = row.items.filter(i => i.x >= threshold).sort((a, b) => a.x - b.x);
    const label = leftItems.map(i => i.text).join(" ").trim();
    const value = rightItems.map(i => i.text).join(" ").trim();

    if (label && value) {
      result += `${label} | ${value}\n`;
    } else if (value) {
      result += `\t${value}\n`;
    } else if (label) {
      result += `${label}\n`;
    }
  }

  console.log("=== TESTO ESTRATTO ===\n" + result.substring(0, 3000));
  return result;
}
