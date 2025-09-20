# Nastavení autentifikačního systému

## Přehled

Aplikace nyní obsahuje kompletní autentifikační systém s následujícími funkcemi:

- **Přihlašování uživatelů** s JWT tokeny
- **Registrace nových uživatelů** (pouze administrátoři)
- **Správa uživatelských rolí** (user/admin)
- **Ochrana tras** a autorizace
- **Ukládání dat na uživatele** - každý uživatel vidí pouze své záznamy

## Výchozí administrátorský účet

Po inicializaci databáze je vytvořen výchozí administrátorský účet:

- **Uživatelské jméno:** `admin`
- **Heslo:** `admin123`
- **Email:** `admin@company.com`
- **Role:** `admin`

## Funkce podle rolí

### Administrátor (admin)
- ✅ Přístup ke všem funkcím aplikace
- ✅ Správa uživatelů (vytváření, mazání)
- ✅ Registrace nových uživatelů
- ✅ Přístup ke správě uživatelů v hlavním menu

### Uživatel (user)
- ✅ Přístup k základním funkcím aplikace
- ✅ Vytváření a správa vlastních záznamů
- ✅ Zobrazení pouze svých dat
- ❌ Nemůže registrovat nové uživatele
- ❌ Nemá přístup ke správě uživatelů

## Bezpečnostní funkce

### JWT Tokeny
- Tokeny jsou platné 7 dní
- Automatické odhlášení při vypršení tokenu
- Bezpečné ukládání v localStorage

### Hashování hesel
- Použití bcryptjs s 12 rounds
- Hesla se nikdy neukládají v plaintextu

### Ochrana dat
- Každý uživatel vidí pouze své záznamy
- API ověřuje oprávnění před každou operací
- Administrátorské funkce jsou chráněny dodatečnou autorizací

## Nastavení prostředí

### Environment Variables

Pro produkci nastavte následující proměnné prostředí:

```bash
# JWT Secret - změňte na bezpečný klíč v produkci!
JWT_SECRET=your-very-secure-secret-key-change-in-production

# Databáze Neon
DATABASE_URL=postgresql://username:password@hostname/database
```

### Bezpečnostní doporučení

1. **Změňte JWT_SECRET** v produkci na silný náhodný klíč
2. **Používejte HTTPS** pro produkční prostředí
3. **Pravidelně aktualizujte hesla** administrátorských účtů
4. **Monitorujte přístupy** k aplikaci

## Použití

### Přihlášení
1. Klikněte na tlačítko přihlášení v pravém horním rohu
2. Zadejte uživatelské jméno a heslo
3. Po úspěšném přihlášení uvidíte své jméno a roli

### Registrace nového uživatele (pouze admin)
1. Přihlaste se jako administrátor
2. Klikněte na "Správa uživatelů" v hlavním menu
3. Klikněte na "Nový uživatel"
4. Vyplňte údaje nového uživatele
5. Nový uživatel se může okamžitě přihlásit

### Správa uživatelů (pouze admin)
- Zobrazení seznamu všech uživatelů
- Vytváření nových uživatelských účtů
- Mazání uživatelských účtů (nelze smazat vlastní účet)
- Zobrazení dat vytvoření účtu

## Technické detaily

### Databázové schéma

```sql
-- Tabulka uživatelů
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Aktualizovaná tabulka časových záznamů
ALTER TABLE time_entries ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
```

### API Endpoints

- `POST /.netlify/functions/auth` - Přihlášení, registrace, ověření tokenu
- `GET/POST/PUT/DELETE /.netlify/functions/time-entries` - Správa časových záznamů (vyžaduje autentifikaci)
- `GET/DELETE /.netlify/functions/users` - Správa uživatelů (vyžaduje admin oprávnění)

### Komponenty

- `AuthProvider` - Globální autentifikační kontext
- `LoginButton` - Komponenta pro přihlášení/registraci
- `ProtectedRoute` - Ochrana tras
- `UserManagement` - Správa uživatelů (pouze admin)

## Řešení problémů

### Uživatel se nemůže přihlásit
1. Zkontrolujte, zda je databáze inicializována
2. Ověřte správnost přihlašovacích údajů
3. Zkontrolujte konzoli prohlížeče pro chyby

### Chyba "Session expired"
- Token vypršel, uživatel se musí znovu přihlásit
- Aplikace automaticky přesměruje na přihlašovací stránku

### Administrátor nemá přístup ke správě uživatelů
1. Ověřte, že má uživatel roli "admin"
2. Zkontrolujte, zda je JWT token platný
3. Restartujte aplikaci a přihlaste se znovu
