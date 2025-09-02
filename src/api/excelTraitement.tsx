/* eslint-disable @typescript-eslint/no-explicit-any */

import * as XLSX from 'xlsx';

export interface ExcelSheet {
  sheetName: string;
  headers: string[];
  data: Record<string, any>[];
  rowCount: number;
  columnCount: number;
}

export interface ExcelParseResult {
  success: boolean;
  fileName: string;
  sheets: ExcelSheet[];
  totalSheets: number;
}

/**
 * Convertit un fichier Excel en JSON avec toutes les feuilles
 */
export async function excelToJson(file: File): Promise<ExcelParseResult> {
  try {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    // Vérifier le type de fichier
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      throw new Error('Format de fichier non supporté. Utilisez .xlsx ou .xls');
    }

    // Convertir le fichier en buffer
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    const sheets = getSheetNames(workbook).map(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const headers = extractHeaders(worksheet);
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];

      return {
        sheetName,
        headers,
        data: jsonData,
        rowCount: jsonData.length,
        columnCount: headers.length
      };
    });

    return {
      success: true,
      fileName: file.name,
      sheets,
      totalSheets: sheets.length
    };

  } catch (error) {
    console.error('Erreur lors de la conversion Excel:', error);
    throw error;
  }
}

/**
 * Extrait les noms de toutes les feuilles du workbook
 */
export function getSheetNames(workbook: XLSX.WorkBook): string[] {
  return workbook.SheetNames;
}

/**
 * Extrait les en-têtes d'une feuille Excel
 */
export function extractHeaders(worksheet: XLSX.WorkSheet): string[] {
  const headers: string[] = [];
  const ref = worksheet['!ref'];
  
  if (!ref) return headers;

  const range = XLSX.utils.decode_range(ref);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: C });
    const cell = worksheet[cellAddress];
    headers.push(cell ? String(cell.v) : `Column_${C + 1}`);
  }

  return headers;
}

/**
 * Nettoie les données Excel (suppression des lignes vides, trim des strings, etc.)
 */
export function cleanExcelData(data: Record<string, any>[]): Record<string, any>[] {
  return data
    .filter(row => !isEmptyRow(row)) // Supprime les lignes vides
    .map(cleanRow); // Nettoie chaque ligne
}

/**
 * Vérifie si une ligne est vide
 */
function isEmptyRow(row: Record<string, any>): boolean {
  return Object.values(row).every(value => 
    value === null || 
    value === undefined || 
    value === '' || 
    (typeof value === 'string' && value.trim() === '')
  );
}

/**
 * Nettoie une ligne de données
 */
function cleanRow(row: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(row)) {
    cleaned[key] = cleanValue(value);
  }
  
  return cleaned;
}

/**
 * Nettoie une valeur individuelle
 */
function cleanValue(value: any): any {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'string') {
    // Trim et suppression des espaces multiples
    const cleaned = value.trim().replace(/\s+/g, ' ');
    
    // Conversion des nombres strings en numbers
    if (/^-?\d+([.,]\d+)?$/.test(cleaned)) {
      return parseFloat(cleaned.replace(',', '.'));
    }
    
    // Conversion des booléens
    if (cleaned.toLowerCase() === 'true') return true;
    if (cleaned.toLowerCase() === 'false') return false;
    
    return cleaned;
  }
  
  return value;
}

/**
 * Fonction utilitaire pour extraire seulement les en-têtes d'un fichier
 */
export async function extractHeadersFromFile(file: File): Promise<{ [sheetName: string]: string[] }> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  
  const result: { [sheetName: string]: string[] } = {};
  
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    result[sheetName] = extractHeaders(worksheet);
  }
  
  return result;
}

/**
 * Fonction utilitaire pour extraire seulement les noms des feuilles
 */
export async function getSheetNamesFromFile(file: File): Promise<string[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  return getSheetNames(workbook);
}