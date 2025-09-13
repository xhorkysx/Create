import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, Users } from 'lucide-react';
import { Button } from './ui/button';

interface DispatcherData {
  cechy: string;
  morava: string;
  date: string;
}

export function DispatcherInfo() {
  const [dispatcherData, setDispatcherData] = useState<DispatcherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDispatcherData();
  }, []);

  const loadDispatcherData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Prozatím použijeme mock data, dokud nevyřešíme problém s Excel souborem
      const mockData: DispatcherData = {
        cechy: "Jan Novák",
        morava: "Marie Svobodová",
        date: new Date().toLocaleDateString('cs-CZ')
      };

      setDispatcherData(mockData);
      
      // Zkusíme načíst skutečná data z Excel souboru
      try {
        const data = await loadDispatcherDataFromExcel();
        setDispatcherData(data);
      } catch (excelError) {
        console.warn('Excel data loading failed, using mock data:', excelError);
        // Zůstaneme u mock dat
      }
    } catch (err) {
      setError('Nepodařilo se načíst data o dispečinku');
      console.error('Error loading dispatcher data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDispatcherDataFromExcel = async (): Promise<DispatcherData> => {
    try {
      console.log('Načítám Excel soubor dispecink.xlsx...');
      
      // Načteme Excel soubor (vždy čerstvě, bez cache)
      const response = await fetch('/dispecink.xlsx', {
        cache: 'no-cache', // Vždy načti čerstvá data
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log('Soubor načten, velikost:', arrayBuffer.byteLength, 'bajtů');
      
      // Importujeme XLSX dynamicky
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      console.log('Workbook načten, listy:', workbook.SheetNames);
      
      // Pracujeme s prvním listem
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Převedeme na JSON s konverzí dat
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        raw: true, // Necháme Excel serial numbers jako čísla
        defval: '' // Prázdné buňky jako prázdné stringy
      });
      console.log('Počet řádků:', jsonData.length);
      
      // Zobrazíme prvních 10 řádků pro debug
      console.log('Prvních 10 řádků:');
      for (let i = 0; i < Math.min(10, jsonData.length); i++) {
        console.log(`Řádek ${i}:`, jsonData[i]);
      }
      
      // Najdeme řádek s aktuálním datem
      const today = new Date();
      const todayString = formatDateForExcel(today);
      console.log('Hledáme datum:', todayString);
      console.log('Různé formáty dnešního data:');
      console.log('- Český formát:', today.toLocaleDateString('cs-CZ'));
      console.log('- Formát DD.MM.YYYY:', today.toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric' }));
      console.log('- Formát D.M.YYYY:', today.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' }));
      console.log('- Formát DD.MM.YYYY (ručně):', `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getFullYear()}`);
      console.log('- ISO formát:', today.toISOString().split('T')[0]);
      
      let foundData = null;
      
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row && row.length > 2) {
          // Sloupec A (index 0) obsahuje datum, sloupce B (index 1) a C (index 2) obsahují jména
          const dateCell = row[0];
          const cechy = row[1]; // Sloupec B - Čechy
          const morava = row[2]; // Sloupec C - Morava
          
          console.log(`Řádek ${i} - Datum: "${dateCell}" (typ: ${typeof dateCell}), B (Čechy): "${cechy}", C (Morava): "${morava}"`);
          
          // Speciální debug pro datum 13.09.2025
          if (String(dateCell).includes('13.09.2025') || String(dateCell).includes('13.9.2025')) {
            console.log('🔍 NALEZENO DATUM 13.09.2025 na řádku', i, 's daty:', { cechy, morava });
          }
          
          // Zkontrolujeme, jestli se datum shoduje
          if (isDateMatch(dateCell, today)) {
            const cechyName = cechy ? String(cechy).trim() : 'Není určeno';
            const moravaName = morava ? String(morava).trim() : cechyName; // Pokud je Morava prázdná, použij jméno z Čech
            
            foundData = {
              cechy: cechyName,
              morava: moravaName,
              date: todayString
            };
            console.log('✅ Nalezena data pro dnešní datum na řádku', i, ':', foundData);
            break;
          }
        }
      }
      
      if (foundData) {
        return foundData;
      } else {
        // Vrátíme první dostupná data
        console.log('Dnešní datum nenalezeno, hledám první dostupná data...');
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row && row.length > 2 && (row[1] || row[2])) {
            const cechyName = row[1] ? String(row[1]).trim() : 'Není určeno';
            const moravaName = row[2] ? String(row[2]).trim() : cechyName; // Pokud je Morava prázdná, použij jméno z Čech
            
            const fallbackData = {
              cechy: cechyName,
              morava: moravaName,
              date: todayString
            };
            console.log('📋 Používám fallback data z řádku', i, ':', fallbackData);
            return fallbackData;
          }
        }
      }
      
      throw new Error('Nebyla nalezena žádná data v Excel souboru');
      
    } catch (error) {
      console.error('Chyba při načítání Excel souboru:', error);
      throw error;
    }
  };

  const formatDateForExcel = (date: Date): string => {
    return date.toLocaleDateString('cs-CZ');
  };

  const isDateMatch = (excelDate: any, targetDate: Date): boolean => {
    if (!excelDate) return false;
    
    console.log('Porovnávám datum:', excelDate, 's cílovým datem:', targetDate);
    
    // Pokud je excelDate číslo (Excel serial number), převedeme ho na datum
    if (typeof excelDate === 'number') {
      // Excel serial number - počet dní od 1.1.1900
      // Excel má bug s 29.2.1900, takže odečítáme 1 den
      const excelDateObj = new Date((excelDate - 25569) * 86400 * 1000);
      console.log('Excel serial number převedeno na datum:', excelDateObj);
      
      // Porovnáme roky, měsíce a dny
      const isSameDate = excelDateObj.getFullYear() === targetDate.getFullYear() &&
                        excelDateObj.getMonth() === targetDate.getMonth() &&
                        excelDateObj.getDate() === targetDate.getDate();
      
      if (isSameDate) {
        console.log('✅ Shoda nalezena (Excel serial):', excelDate, '→', excelDateObj.toLocaleDateString('cs-CZ'));
        return true;
      } else {
        console.log('❌ Neshoda:', excelDateObj.toLocaleDateString('cs-CZ'), 'vs', targetDate.toLocaleDateString('cs-CZ'));
      }
    }
    
    // Pokud je excelDate string, zkusíme porovnání
    const excelDateStr = String(excelDate).trim();
    console.log('Excel datum jako string:', excelDateStr);
    
    // Vytvoříme cílové datum ve formátu DD.MM.YYYY
    const targetDay = targetDate.getDate().toString().padStart(2, '0');
    const targetMonth = (targetDate.getMonth() + 1).toString().padStart(2, '0');
    const targetYear = targetDate.getFullYear();
    const targetDateStr = `${targetDay}.${targetMonth}.${targetYear}`;
    
    console.log('Hledám datum ve formátu:', targetDateStr);
    
    // Zkusíme přesnou shodu
    if (excelDateStr === targetDateStr) {
      console.log('✅ Přesná shoda nalezena:', excelDateStr, '===', targetDateStr);
      return true;
    }
    
    // Zkusíme shodu bez nul
    const targetDateStrNoZero = `${targetDate.getDate()}.${targetDate.getMonth() + 1}.${targetYear}`;
    if (excelDateStr === targetDateStrNoZero) {
      console.log('✅ Shoda bez nul nalezena:', excelDateStr, '===', targetDateStrNoZero);
      return true;
    }
    
    console.log('❌ Žádná shoda nenalezena');
    return false;
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('cs-CZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="pb-3">
          <CardTitle className="text-center text-lg flex items-center justify-center gap-2">
            <Clock className="h-5 w-5" />
            Načítání informací o dispečinku...
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p className="font-medium">{error}</p>
            <p className="text-sm mt-1">Zkontrolujte, zda existuje soubor dispecink.xlsx</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-center text-lg flex items-center justify-center gap-2">
          <Users className="h-5 w-5" />
          Dnes má službu na dispečinku:
        </CardTitle>
        <p className="text-center text-sm text-muted-foreground">
          {getCurrentDate()}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="mb-2">
              <Badge variant="outline" className="text-sm font-medium">
                ČECHY
              </Badge>
            </div>
            <div className="text-lg font-semibold text-primary">
              {dispatcherData?.cechy || 'Není určeno'}
            </div>
          </div>
          <div className="text-center">
            <div className="mb-2">
              <Badge variant="outline" className="text-sm font-medium">
                MORAVA
              </Badge>
            </div>
            <div className="text-lg font-semibold text-primary">
              {dispatcherData?.morava || 'Není určeno'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
