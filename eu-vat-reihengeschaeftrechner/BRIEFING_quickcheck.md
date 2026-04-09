# Briefing: „Quick Check" Tab — Noob-Modus für RGR

## Kontext

Der EU VAT Reihengeschäftsrechner (`docs/assets/scripts/app.js`) ist ein komplexes Tool
für Steuerexperten. Ziel ist ein neuer Tab **„🟢 Quick Check"** der für Buchhalter ohne
Steuerrechtskenntnisse gedacht ist — simpel, klar, handlungsorientiert.

## Aufgabe

Neuen Tab `tab-quickcheck` in die bestehende App integrieren:
- `docs/index.html` → Tab-Button hinzufügen
- `docs/assets/scripts/app.js` → `buildQuickCheck()` Funktion + Event-Handler
- `docs/assets/styles/app.css` → Styles für Quick Check UI

Der Tab erscheint **immer** (nicht nur im Expert-Modus). Er hat einen **komplett eigenen
State** — unabhängig vom Haupt-Formular.

---

## Phase 1: Nur 3-Parteien-Modus

EPDE oder EPROHA ist immer der **Zwischenhändler** (Mitte der Kette):
```
Lieferant (Abgangsland) → EPDE/EPROHA → Kunde (Empfangsland)
```

Abgangs- und Empfangsland sind NIE der Sitz von EPDE/EPROHA selbst.
(2P, Lohnveredelung, 4P kommen in späteren Phasen)

---

## Inputs (4 Felder)

### 1. Gesellschaft
- Radio oder Dropdown: **EPDE** | **EPROHA**
- EPDE: Sitz DE, UIDs in DE/SI/LV/EE/NL/BE/CZ/PL
- EPROHA: Sitz AT, UIDs in AT/DE/CH

### 2. Abgangsland (Lieferantenland)
- Dropdown, alle EU-27 + CH + GB
- Vollständige Ländernamen auf Deutsch
- Alphabetisch sortiert

### 3. Empfangsland (Kundenland)  
- Dropdown, alle EU-27 + CH + GB
- Alphabetisch sortiert

### 4. Wer organisiert den Transport?
- Radio: **Lieferant** | **EPDE/EPROHA** | **Kunde**

---

## Kernlogik (in `buildQuickCheck()`)

### Schritt 1: Bewegte Lieferung bestimmen

```
Transport = Lieferant  → L1 ist bewegte Lieferung (Lieferant→Zwischenhändler)
Transport = EPDE/EPROHA → L1 ist bewegte Lieferung (Zwischenhändler gilt als Käufer)
Transport = Kunde       → L2 ist bewegte Lieferung (Zwischenhändler→Kunde)
```

**Wichtig Art. 36a Quick Fix:** Wenn Transport = EPDE/EPROHA UND EPDE/EPROHA
verwendet eine UID des Abgangslandes → L2 wird bewegte Lieferung.
Diese Ausnahme als Hinweis anzeigen, nicht automatisch umschalten.

### Schritt 2: Steuerliche Behandlung der bewegten Lieferung

**Sonderfälle zuerst prüfen:**
- Abgangsland = CH oder GB → Einfuhr (nicht ig. Lieferung)
- Empfangsland = CH → Ausfuhr (nicht ig. Lieferung)
- Empfangsland = GB → Ausfuhr (nicht ig. Lieferung)

**EU→EU (Normalfall):**
- Bewegte Lieferung: steuerfreie EU-Lieferung (ig. Lieferung) wenn Länder verschieden
- Ruhende Lieferung: steuerpflichtig im jeweiligen Lieferort-Land

### Schritt 3: SAP-Steuerkennzeichen

Basierend auf UID-Registrierungen der gewählten Gesellschaft:

**EPDE** (Sitz DE):
```
Ausgangsrechnung ig. Lieferung DE → KO
Eingangsrechnung ig. Erwerb DE    → VH
Ausgangsrechnung Ausfuhr DE       → A0 (Drittland) / G0 (CH-spezifisch)
RC-Eingang DE (§ 13b)             → V0+U0 Kombination
Inland DE                         → K9 (AR) / V9 (ER)
```

**EPROHA** (Sitz AT):
```
Ausgangsrechnung ig. Lieferung AT → KO
Eingangsrechnung ig. Erwerb AT    → VH (AT-Pendant)
Ausgangsrechnung Ausfuhr AT       → A0
RC-Eingang AT                     → entsprechend AT UStG
Inland AT                         → Normalsatz 20%
```

**Hinweis:** SAP-Codes aus der bestehenden App-Logik (`uidTreatments`, `computeTax()`)
übernehmen — nicht neu erfinden. Vor Implementierung in `app.js` nach den relevanten
Mapping-Tabellen suchen (grep nach `sapCode`, `badge-ig`, `badge-export`).

### Schritt 4: Dreiecksgeschäft-Chance

Anzeigen wenn:
- 3 verschiedene EU-Länder beteiligt (Abgang, EPDE/EPROHA-UID-Land, Empfang)
- Alle drei EU-Mitglieder (nicht CH/GB)
- Kurzer Hinweis: „Dreiecksgeschäft nach Art. 141 MwStSystRL möglicherweise anwendbar"

### Schritt 5: Registrierungsrisiko

Einfache Regel: Wenn die ruhende Lieferung in einem Land stattfindet, in dem
EPDE/EPROHA **keine UID hat** → Hinweis „Prüfen ob Registrierungspflicht besteht"

---

## Output-Layout

```
┌─────────────────────────────────────────────────────┐
│  🟢 Quick Check                                     │
│  ─────────────────────────────────────────────────  │
│  [Gesellschaft] [Abgangsland▼] [Empfangsland▼]     │
│  Transport: ○ Lieferant  ○ EPDE/EPROHA  ○ Kunde    │
│                                                     │
│  ══════════════════════════════════════════════════ │
│                                                     │
│  📦 Bewegte Lieferung: L1                           │
│  Begründung: Lieferant organisiert Transport        │
│                                                     │
│  ┌─────────────────┬───────────────────────────┐   │
│  │ EINGANGSRECHNUNG│ AUSGANGSRECHNUNG           │   │
│  │ (L1)           │ (L2)                       │   │
│  ├─────────────────┼───────────────────────────┤   │
│  │ Steuerfreie    │ Steuerpflichtig DE 19%     │   │
│  │ EU-Lieferung   │                            │   │
│  │                │                            │   │
│  │ SAP: VH        │ SAP: K9                    │   │
│  │                │                            │   │
│  │ Muss enthalten:│ Muss enthalten:            │   │
│  │ • UID Lieferant│ • UID EPDE                 │   │
│  │ • UID EPDE     │ • UID Kunde                │   │
│  │ • „steuerfreie │ • Steuerbetrag             │   │
│  │   ig. Liefg."  │                            │   │
│  └─────────────────┴───────────────────────────┘   │
│                                                     │
│  ℹ️  Weitere Hinweise                               │
│  • Dreiecksgeschäft möglicherweise anwendbar        │
│  • Kein Registrierungsrisiko erkannt                │
└─────────────────────────────────────────────────────┘
```

---

## Technische Vorgaben

### Integration
- Tab-Button in `index.html` als erstes Tab (ganz links) einfügen
- `buildQuickCheck()` in `app.js` — eigene Funktion, kein Eingriff in bestehende Logik
- Eigener State: `qcState = { company, dep, dest, transport }` — nicht `selectedDep` etc. verwenden
- Event-Listener auf die 4 Inputs → `renderQuickCheck()` aufrufen
- Ergebnis in `#tab-quickcheck` rendern

### Was NICHT anfassen
- VATEngine IIFE
- `analyze()`, `analyze2()` Kernpfade
- Bestehende Tab-Logik (`setT()`, `renderResult()`)
- `selectedDep`, `selectedDest`, `selectedTransport` — das ist der Haupt-State

### Style
- Selbes Design-System wie bestehende App (CSS-Variablen aus `app.css`)
- Zwei-Spalten-Tabelle (ER | AR) auf Desktop, Stack auf Mobile
- Grüner Akzent für „Quick Check" Badge
- Keine neuen externen Dependencies

### Sprache
- Deutsch
- Vereinfacht: „steuerfreie EU-Lieferung" statt „innergemeinschaftliche Lieferung"
- Technische Begriffe (SAP-Code, UID) bleiben — das sind Buchhalter, keine Laien

---

## Referenz-Länder (EU-27 + CH + GB)

```javascript
const QC_COUNTRIES = [
  { code: 'AT', name: 'Österreich' },
  { code: 'BE', name: 'Belgien' },
  { code: 'BG', name: 'Bulgarien' },
  { code: 'CH', name: 'Schweiz' },
  { code: 'CY', name: 'Zypern' },
  { code: 'CZ', name: 'Tschechien' },
  { code: 'DE', name: 'Deutschland' },
  { code: 'DK', name: 'Dänemark' },
  { code: 'EE', name: 'Estland' },
  { code: 'ES', name: 'Spanien' },
  { code: 'FI', name: 'Finnland' },
  { code: 'FR', name: 'Frankreich' },
  { code: 'GB', name: 'Großbritannien' },
  { code: 'GR', name: 'Griechenland' },
  { code: 'HR', name: 'Kroatien' },
  { code: 'HU', name: 'Ungarn' },
  { code: 'IE', name: 'Irland' },
  { code: 'IT', name: 'Italien' },
  { code: 'LT', name: 'Litauen' },
  { code: 'LU', name: 'Luxemburg' },
  { code: 'LV', name: 'Lettland' },
  { code: 'MT', name: 'Malta' },
  { code: 'NL', name: 'Niederlande' },
  { code: 'PL', name: 'Polen' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Rumänien' },
  { code: 'SE', name: 'Schweden' },
  { code: 'SI', name: 'Slowenien' },
  { code: 'SK', name: 'Slowakei' },
];
```

---

## Einstieg für Claude Code

1. `app.js` lesen — grep nach `sapCode`, `uidTreatments`, `computeTax`, `badge-ig`, `badge-export` um SAP-Mapping zu verstehen
2. `index.html` lesen — Tab-Struktur verstehen
3. `app.css` lesen — CSS-Variablen und bestehende Card/Badge-Styles
4. `buildQuickCheck()` implementieren
5. Tab in `index.html` eintragen
6. Styles in `app.css` ergänzen
7. `npm run check` ausführen — keine Fehler

## Wichtig
- Keine Änderungen an bestehender Logik
- Nach jeder Änderung `npm run check` laufen lassen
- Ergebnis im Browser testen mit konkreten Fällen (z.B. DE→PL, Transport Lieferant, EPDE)

---

## Testfälle (Erwartete Ergebnisse)

Die folgenden Fälle sind als Abnahmekriterien zu verwenden. Alle mit **EPDE** (Sitz DE).

---

### TC-01: DE → PL, Transport: Lieferant, EPDE

**Konstellation:**
- Lieferant: DE → EPDE → Kunde: PL
- Transport organisiert: Lieferant

**Erwartetes Ergebnis:**
- Bewegte Lieferung: **L1** (Lieferant→EPDE)
- Begründung: Lieferant organisiert Transport → L1 bewegte Lieferung

**Eingangsrechnung (L1, Lieferant→EPDE):**
- Behandlung: Steuerfreie EU-Lieferung (ig. Lieferung)
- SAP-Code: **VH** (ig. Erwerb DE)
- Muss enthalten: UID Lieferant (DE), UID EPDE (DE), Hinweis auf Steuerfreiheit
- EPDE bucht: ig. Erwerb in DE → Vorsteuer und USt saldieren sich

**Ausgangsrechnung (L2, EPDE→Kunde):**
- Behandlung: Ruhende Lieferung → steuerpflichtig in **DE** (Abgangsland)
- Steuersatz: 19% DE
- SAP-Code: **K9** (DE Inland Ausgang)
- Muss enthalten: UID EPDE (DE), UID Kunde (PL), Steuerbetrag 19%

**Weitere Hinweise:**
- Dreiecksgeschäft: ❌ Nein (nur 2 EU-Länder: DE + PL, EPDE hat DE-UID = Abgangsland)
- Registrierungsrisiko: Keines (EPDE hat DE-UID)

---

### TC-02: FR → DE, Transport: Kunde, EPDE

**Konstellation:**
- Lieferant: FR → EPDE → Kunde: DE
- Transport organisiert: Kunde

**Erwartetes Ergebnis:**
- Bewegte Lieferung: **L2** (EPDE→Kunde)
- Begründung: Kunde organisiert Transport → L2 bewegte Lieferung

**Eingangsrechnung (L1, Lieferant→EPDE):**
- Behandlung: Ruhende Lieferung → steuerpflichtig in **FR** (Abgangsland)
- Steuersatz: 20% FR
- SAP-Code: abhängig ob EPDE in FR registriert → **kein** (EPDE hat keine FR-UID)
- Hinweis: EPDE hat keine FR-UID → **Registrierungsprüfung FR erforderlich**
- Lieferant stellt FR-Rechnung mit 20% MwSt aus; EPDE hat ggf. kein Vorsteuerrecht ohne FR-Reg.

**Ausgangsrechnung (L2, EPDE→Kunde):**
- Behandlung: Steuerfreie EU-Lieferung (ig. Lieferung)
- SAP-Code: **KO** (ig. Lieferung DE-Ausgang)
- Muss enthalten: UID EPDE (DE), UID Kunde (DE), Hinweis auf Steuerfreiheit

**Weitere Hinweise:**
- Dreiecksgeschäft: ❌ Nein (FR + DE, nur 2 Länder ohne EPDE-eigenes drittes Land)
- Registrierungsrisiko: ⚠️ **FR** — EPDE hat keine UID in FR, ruhende L1 liegt in FR

---

### TC-03: IT → AT, Transport: EPDE, EPROHA

**Konstellation:**
- Lieferant: IT → EPROHA → Kunde: AT
- Transport organisiert: EPROHA

**Erwartetes Ergebnis:**
- Bewegte Lieferung: **L1** (Lieferant→EPROHA)
- Begründung: Zwischenhändler (EPROHA) organisiert Transport → Standard L1 bewegte Lieferung
- Art. 36a Hinweis: Falls EPROHA IT-UID verwendet → würde zu L2 wechseln (EPROHA hat keine IT-UID → nicht relevant)

**Eingangsrechnung (L1, Lieferant→EPROHA):**
- Behandlung: Steuerfreie EU-Lieferung (ig. Lieferung)
- SAP-Code: **VH** (ig. Erwerb AT, da EPROHA Sitz AT)
- Muss enthalten: UID Lieferant (IT), UID EPROHA (AT), Steuerfreiheitshinweis

**Ausgangsrechnung (L2, EPROHA→Kunde):**
- Behandlung: Ruhende Lieferung → steuerpflichtig in **IT** (Abgangsland)
- Steuersatz: 22% IT
- SAP-Code: kein AT-Code anwendbar — EPROHA hat keine IT-UID
- Hinweis: ⚠️ **Registrierungsprüfung IT erforderlich**

**Weitere Hinweise:**
- Dreiecksgeschäft: ✅ **Möglicherweise anwendbar** (IT + AT + EPROHA-UID AT = 3 verschiedene EU-Länder)
- Registrierungsrisiko: ⚠️ **IT** — EPROHA hat keine UID in IT

---

### TC-04: PL → GB, Transport: Lieferant, EPDE

**Konstellation:**
- Lieferant: PL → EPDE → Kunde: GB
- Transport organisiert: Lieferant

**Erwartetes Ergebnis:**
- Bewegte Lieferung: **L1** (Lieferant→EPDE)

**Eingangsrechnung (L1, Lieferant→EPDE):**
- Behandlung: Steuerfreie EU-Lieferung (ig. Lieferung)
- SAP-Code: **VH** (ig. Erwerb, EPDE hat PL-UID)
- Muss enthalten: UID Lieferant (PL), UID EPDE (PL), Steuerfreiheitshinweis

**Ausgangsrechnung (L2, EPDE→Kunde):**
- Behandlung: **Ausfuhr** (GB ist Drittland, kein EU-Mitglied)
- SAP-Code: **A0** (Ausfuhr DE)
- Muss enthalten: UID EPDE (DE), Ausfuhrnachweise, kein Steuerausweis
- Hinweis: Zollanmeldung erforderlich, EORI-Nummer

**Weitere Hinweise:**
- Dreiecksgeschäft: ❌ Nein (GB ist kein EU-Mitglied)
- Registrierungsrisiko: Keines für EPDE; GB-Importpflichten beim Kunden

---

### TC-05: CH → DE, Transport: Kunde, EPDE

**Konstellation:**
- Lieferant: CH → EPDE → Kunde: DE
- Transport organisiert: Kunde

**Erwartetes Ergebnis:**
- Bewegte Lieferung: **L2** (EPDE→Kunde, da Kunde transportiert)

**Eingangsrechnung (L1, Lieferant→EPDE):**
- Behandlung: **Einfuhr** aus CH (Drittland)
- SAP-Code: kein ig. Erwerb — Einfuhrumsatzsteuer (EUSt)
- Hinweis: Zollanmeldung + EUSt-Bescheid als Vorsteuerbeleg, kein RC

**Ausgangsrechnung (L2, EPDE→Kunde):**
- Behandlung: Ruhende Lieferung → steuerpflichtig in **DE** (wo Ware beim Transportbeginn liegt nach Einfuhr)
- Steuersatz: 19% DE
- SAP-Code: **K9** (DE Inland)
- Muss enthalten: UID EPDE (DE), Steuerbetrag 19%

**Weitere Hinweise:**
- Dreiecksgeschäft: ❌ Nein (CH ist kein EU-Mitglied)
- Registrierungsrisiko: Keines

---

### TC-06: DE → SI, Transport: EPDE, EPDE — Art. 36a Sonderfall

**Konstellation:**
- Lieferant: DE → EPDE → Kunde: SI
- Transport organisiert: EPDE
- EPDE verwendet: DE-UID (= Abgangsland-UID)

**Erwartetes Ergebnis:**
- Standard: Bewegte Lieferung L1
- **Art. 36a Hinweis:** Da EPDE DE-UID (= Abgangsland) verwendet → L2 wird zur bewegten Lieferung
- Hinweis prominent anzeigen: „Achtung: Bei Verwendung der DE-UID durch EPDE gilt Art. 36a — L2 ist die bewegte Lieferung"

**Bei Art. 36a (EPDE mit DE-UID):**

*Eingangsrechnung (L1 — jetzt ruhend):*
- Steuerpflichtig in DE, 19%
- SAP: K9 (Inland-Eingang) oder V9
- Lieferant stellt DE-Rechnung mit 19% aus

*Ausgangsrechnung (L2 — jetzt bewegte):*
- Steuerfreie EU-Lieferung DE→SI
- SAP: **KO** (ig. Lieferung DE-Ausgang)
- EPDE verwendet DE-UID

**Weitere Hinweise:**
- Dreiecksgeschäft: ✅ Möglicherweise anwendbar (DE + SI + EPDE mit DE-UID — 3 Länder wenn Kunde-UID SI)
- Registrierungsrisiko: Keines (EPDE hat SI-UID)

---

### Zusammenfassung Testmatrix

| TC | Von | Nach | Transport | Gesellschaft | Bewegte L | Besonderheit |
|----|-----|------|-----------|--------------|-----------|--------------|
| 01 | DE | PL | Lieferant | EPDE | L1 | Standard EU-EU |
| 02 | FR | DE | Kunde | EPDE | L2 | Reg.risiko FR |
| 03 | IT | AT | EPROHA | EPROHA | L1 | Dreieck möglich, Reg.risiko IT |
| 04 | PL | GB | Lieferant | EPDE | L1 | Ausfuhr GB |
| 05 | CH | DE | Kunde | EPDE | L2 | Einfuhr CH |
| 06 | DE | SI | EPDE | EPDE | L1→L2* | Art. 36a Sonderfall |
