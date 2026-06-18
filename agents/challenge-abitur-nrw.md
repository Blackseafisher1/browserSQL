# Challenge: NRW Q1 Abitur SELECT-Queries (German)

## Ziel
Ein großer, integrierter Challenge-Modus, der alle SELECT-bezogenen Abfragetypen aus dem Q1-Lehrplan (NRW, Grundkurs/Leistungskurs) abdeckt. Fokus ausschließlich auf `SELECT`-Queries — kein CREATE, ALTER, DROP, INSERT, UPDATE, DELETE.

**Schwerpunkt: Grundlagen festigen!** Viele Aufgaben zu Basics, weniger exotische Funktionen.

## Anforderungen

### 1. Challenge-Typ "Abitur-Training NRW"
- Ein großer Challenge-Datensatz mit **vielen Aufgaben (40-50)**
- Jede Aufgabe ist eine einzelne SELECT-Query, die ein bestimmtes Konzept prüft
- Die Challenge ist **standardmäßig installiert** (default challenge, kein Upload nötig)
- **Alles auf Deutsch** — Tabellenamen, Spaltennamen, Daten, Aufgabenstellung, Musterlösung

### 2. Datenbasis (deutsches Schema)
```sql
CREATE TABLE schueler (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  klasse TEXT NOT NULL,
  geburtsdatum TEXT NOT NULL
);

CREATE TABLE faecher (
  id INTEGER PRIMARY KEY,
  bezeichnung TEXT NOT NULL,
  kuerzel TEXT NOT NULL
);

CREATE TABLE noten (
  id INTEGER PRIMARY KEY,
  schueler_id INTEGER NOT NULL,
  fach_id INTEGER NOT NULL,
  note REAL NOT NULL,
  datum TEXT NOT NULL,
  FOREIGN KEY (schueler_id) REFERENCES schueler(id),
  FOREIGN KEY (fach_id) REFERENCES faecher(id)
);

CREATE TABLE lehrer (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  kuerzel TEXT NOT NULL
);

CREATE TABLE unterrichtet (
  lehrer_id INTEGER NOT NULL,
  fach_id INTEGER NOT NULL,
  PRIMARY KEY (lehrer_id, fach_id),
  FOREIGN KEY (lehrer_id) REFERENCES lehrer(id),
  FOREIGN KEY (fach_id) REFERENCES faecher(id)
);
```

Seed-Daten: realistische deutsche Namen (Müller, Schmidt, Çiçek, etc.), Klassen (5a, 7c, Q1, etc.), Fächer (Mathematik, Deutsch, Englisch, Biologie, etc.), Noten (1,0 bis 6,0), Lehrer (Herr/Frau + Name).

### 3. Abgedeckte Konzepte (nach Wichtigkeit sortiert)

#### Grundlagen — **viele Aufgaben (15-20)**
- `SELECT` mit spezifischen Spalten
- `WHERE` mit Vergleichsoperatoren (`=`, `<>`, `>`, `<`, `>=`, `<=`)
- `AND` / `OR` / `NOT` Verknüpfungen
- `IS NULL` / `IS NOT NULL`
- `LIKE` mit `%` und `_`
- `IN` / `NOT IN`
- `BETWEEN`
- `ORDER BY ASC / DESC`
- `DISTINCT`
- `LIMIT`
- `UNION` / `UNION ALL` ← hier eingeordnet, nicht fortgeschritten
- Kombinationen (z.B. WHERE + ORDER BY + LIMIT)

#### Aggregate & Gruppierung — **viele Aufgaben (10-12)**
- `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`
- `GROUP BY`
- `HAVING` (mit Aggregatfunktionen)
- `ROUND()`
- Kombinationen (GROUP BY + HAVING + ORDER BY)

#### Joins — **viele Aufgaben (8-10)**
- `INNER JOIN` (zwei Tabellen)
- `LEFT JOIN` (mit NULL-Ergebnissen)
- `INNER JOIN` (drei Tabellen / Multi-Join) ← explizit genannt
- Selbst-Join

#### Unterabfragen — **einige Aufgaben (5-7)**
- Subquery in `WHERE` mit `IN`
- Skalarwertige Subquery in `SELECT`
- Subquery in `FROM` (abgeleitete Tabelle)
- `EXISTS` / `NOT EXISTS`
- Korrelierte Subquery

#### Fortgeschritten — **wenige Aufgaben (3-5)**
- `CASE WHEN ... THEN ... END`
- `COALESCE()` / `IFNULL()`
- String-Funktionen (`UPPER`, `LOWER`, `LENGTH`, `SUBSTR`)
- Datumsfunktionen (`DATE`, `STRFTIME`)

### 4. Aufgabenformat
```js
{
  id: 'abitur-01',
  title: 'Aufgabentitel auf Deutsch',
  description: `Aufgabenstellung auf Deutsch.
  Erwartet wird: konkrete Spalten, Filterbedingungen, Sortierung.`,
  difficulty: 'leicht',     // leicht / mittel / schwer
  category: 'Grundlagen',   // Grundlagen / Aggregate / Joins / Unterabfragen / Fortgeschritten
  seed: SEED_ABITUR,
  check: {
    type: 'result',
    expectedSql: 'SELECT ...',  // Musterlösung (mit AS-Alias bei Mehrdeutigkeit)
  },
  sql: 'SELECT ...',        // Für View Solution
  hint: 'Tipp auf Deutsch...',
}
```

**Wichtig bei Musterlösungen:**
- Bei Joins mit gleichen Spaltennamen `AS`-Aliase verwenden (z.B. `schueler.name AS schueler_name`)
- In der Aufgabenstellung genau sagen, welche Spalten returned werden sollen

### 5. Default-Challenge-System
- Es gibt einen Mechanismus für **default challenges**, die ohne Benutzereingriff da sind
- Diese werden beim ersten Laden automatisch in die Challenge-Liste aufgenommen
- Sie sind nicht löschbar
- Der Challenge-Bereich zeigt standardmäßig "Abitur-Training NRW" an
- Weitere default challenges können später ergänzt werden

### 6. UI & UX
- Die Challenge ist im bestehenden Challenge-Panel sichtbar
- Aufgaben sind nach Kategorien sortiert (Grundlagen, Aggregate, Joins, etc.)
- Fortschritt wird pro Aufgabe gespeichert
- Aufgaben können in beliebiger Reihenfolge bearbeitet werden
- Anzeige: "13/45 Aufgaben gelöst"

### 7. Umfang
- **40-50 Aufgaben** insgesamt
- Schwerpunkt auf Grundlagen (ca. 40% der Aufgaben)
- Realistische Abitur-Aufgaben aus NRW Q1
- Aufgabenstellung klar und eindeutig (Spaltennamen, Erwartung, Sortierung)
- Musterlösung für jede Aufgabe

## Nicht enthalten
- CREATE/ALTER/DROP
- INSERT/UPDATE/DELETE
- Normalisierung, Transaktionen, Indexe
- Theorie-Fragen
- SQLite-spezifische Eigenheiten (nur Standard-SQL)
