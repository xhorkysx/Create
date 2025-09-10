# Lokální vývoj aplikace

## Přehled

Aplikace nyní podporuje lokální vývoj s mock daty, takže můžete ladit změny bez nutnosti publikovat na GitHub nebo mít přístup k produkční databázi.

## Jak to funguje

### Mock API režim
- V lokálním prostředí se automaticky používá mock API
- Mock data obsahují všechny dokumenty a časové záznamy
- Simuluje network delay pro realističtější testování
- Všechny funkce (CRUD operace) fungují stejně jako v produkci

### Přepínání mezi režimy
V souboru `src/config/api.js` můžete nastavit:
```javascript
export const USE_MOCK_API = true;  // true = mock, false = skutečné API
```

## Spuštění lokálního vývoje

1. **Spusťte vývojový server:**
   ```bash
   npm run dev
   ```

2. **Otevřete aplikaci:**
   - Aplikace bude dostupná na `http://localhost:3000`
   - Automaticky se použije mock API

3. **Testování funkcí:**
   - Karta řidiče s navigačními ikonami
   - Editace dokumentů
   - Časové záznamy
   - Všechny funkce fungují s mock daty

## Mock data

### Doklady
- ADR průkaz (brzy vyprší - 45 dnů)
- Řidičský průkaz (platný - 1200 dnů)
- Občanský průkaz (platný - 2000 dnů)
- Karta do tachografu (platný - 300 dnů)

### Interní dokumenty
- Compliance (brzy vyprší - 15 dnů)
- Hesla do PC (brzy vyprší - 10 dnů)
- Kybernetická bezpečnost (brzy vyprší - 5 dnů)
- Zdravotní prohlídka (platný - 400 dnů)

### Střediska
- Střelice (brzy vyprší - 8 dnů)
- Loukov (brzy vyprší - 3 dny)
- Šlapánov (vypršel - -5 dnů)
- Klobouky (brzy vyprší - 12 dnů)
- Cerekvice (brzy vyprší - 6 dnů)
- Sedlnice (vypršel - -10 dnů)
- Smyslov (brzy vyprší - 9 dnů)
- Mstětice (brzy vyprší - 4 dny)

## Publikování na GitHub

Až budete spokojeni s lokálními změnami:

1. **Změňte konfiguraci pro produkci:**
   ```javascript
   // src/config/api.js
   export const USE_MOCK_API = false;
   ```

2. **Commit a push:**
   ```bash
   git add .
   git commit -m "Your changes description"
   git push origin main
   ```

3. **Netlify automaticky nasadí změny** a aplikace bude používat skutečnou databázi.

## Výhody tohoto přístupu

- ✅ Rychlý lokální vývoj bez závislosti na internetu
- ✅ Testování všech funkcí s realistickými daty
- ✅ Snadné ladění UI a UX
- ✅ Bezpečné experimentování
- ✅ Automatické přepínání mezi mock a produkčním API

## Struktura souborů

```
src/
├── services/
│   ├── api.js          # Hlavní API služba (s přepínáním)
│   └── mockApi.js      # Mock implementace
├── config/
│   └── api.js          # Konfigurace režimu
└── components/
    ├── DriverCard.tsx
    └── DriverCardNavigation.tsx
```
