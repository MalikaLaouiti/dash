  /* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from 'react';
import { excelToJson, cleanExcelData, extractHeadersFromFile, getSheetNamesFromFile } from '@/api/excelTraitement';

export default function Home() {
  const [data, setData] = useState<any[]>([]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 1. Conversion complète
      const result = await excelToJson(file);
      console.log('Toutes les feuilles:', result);

      // 2. Juste les en-têtes
      const headers = await extractHeadersFromFile(file);
      console.log('En-têtes par feuille:', headers);

      // 3. Juste les noms de feuilles
      const sheetNames = await getSheetNamesFromFile(file);
      console.log('Noms des feuilles:', sheetNames);

      // 4. Nettoyage des données
      const cleanedData = result.sheets.map(sheet => ({
        ...sheet,
        data: cleanExcelData(sheet.data)
      }));

      setData(cleanedData);

    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div>
      <input type="file" accept=".xlsx,.xls" onChange={handleFile} />
      
      {data.map((sheet, index) => (
        <div key={index}>
          <h3>Feuille: {sheet.sheetName}</h3>
          <p>En-têtes: {sheet.headers.join(', ')}</p>
          <pre>{JSON.stringify(sheet.data.slice(0, 3), null, 2)}</pre>
        </div>
      ))}
    </div>
  );
};

