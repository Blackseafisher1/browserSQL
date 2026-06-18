import { SEED_ABITUR, SEED_EMPLOYEES, SEED_SHOP_EXT, SEED_MARCH_ORDERS } from './seeds.js';

const T = SEED_ABITUR;
const TE = SEED_EMPLOYEES;

const SEED_SALES = `
CREATE TABLE mitarbeiter (id INTEGER PRIMARY KEY, name TEXT NOT NULL, abteilung TEXT NOT NULL);
INSERT INTO mitarbeiter VALUES (1, 'Anna Müller', 'Vertrieb'), (2, 'Ben Schmidt', 'Vertrieb'), (3, 'Clara Fischer', 'Marketing'), (4, 'David Weber', 'Marketing'), (5, 'Emma Koch', 'IT'), (6, 'Finn Lehmann', 'IT'), (7, 'Greta Schulz', 'Vertrieb'), (8, 'Henrik Wagner', 'IT');
CREATE TABLE produkte (id INTEGER PRIMARY KEY, name TEXT NOT NULL, kategorie TEXT NOT NULL, preis REAL NOT NULL);
INSERT INTO produkte VALUES (1, 'Laptop Pro', 'Elektronik', 1499.99), (2, 'Maus X1', 'Zubehör', 49.99), (3, 'Tastatur TK', 'Zubehör', 89.99), (4, 'Monitor 27"', 'Elektronik', 399.99), (5, 'Kopfhörer KH', 'Audio', 199.99), (6, 'Dockingstation', 'Zubehör', 129.99);
CREATE TABLE verkäufe (id INTEGER PRIMARY KEY, mitarbeiter_id INTEGER NOT NULL, produkt_id INTEGER NOT NULL, menge INTEGER NOT NULL, umsatz REAL NOT NULL, datum TEXT NOT NULL, FOREIGN KEY (mitarbeiter_id) REFERENCES mitarbeiter(id), FOREIGN KEY (produkt_id) REFERENCES produkte(id));
INSERT INTO verkäufe VALUES
  (1, 1, 1, 2, 2999.98, '2025-01-15'), (2, 1, 2, 5, 249.95, '2025-01-16'), (3, 2, 4, 1, 399.99, '2025-01-16'),
  (4, 3, 5, 3, 599.97, '2025-01-17'), (5, 4, 6, 2, 259.98, '2025-01-18'), (6, 1, 3, 4, 359.96, '2025-01-20'),
  (7, 5, 1, 1, 1499.99, '2025-01-21'), (8, 5, 4, 2, 799.98, '2025-01-22'), (9, 6, 5, 1, 199.99, '2025-01-23'),
  (10, 2, 2, 10, 499.90, '2025-01-24'), (11, 7, 1, 1, 1499.99, '2025-01-25'), (12, 7, 6, 3, 389.97, '2025-01-26'),
  (13, 8, 3, 2, 179.98, '2025-01-27'), (14, 8, 4, 1, 399.99, '2025-01-28'), (15, 3, 1, 1, 1499.99, '2025-02-01'),
  (16, 1, 5, 2, 399.98, '2025-02-02'), (17, 2, 1, 1, 1499.99, '2025-02-03'), (18, 5, 6, 4, 519.96, '2025-02-04'),
  (19, 6, 2, 8, 399.92, '2025-02-05'), (20, 7, 4, 2, 799.98, '2025-02-06');
`;

const SEED_BAU = `
CREATE TABLE projekte (id INTEGER PRIMARY KEY, name TEXT NOT NULL, startdatum TEXT NOT NULL, enddatum TEXT, budget REAL NOT NULL);
INSERT INTO projekte VALUES (1, 'Neubau Schule', '2024-01-15', '2025-06-30', 2500000), (2, 'Sanierung Sporthalle', '2024-03-01', '2025-02-28', 850000), (3, 'Brückenbau A1', '2024-06-01', '2026-12-31', 12000000), (4, 'Radweg Nord', '2024-09-01', '2025-08-31', 350000), (5, 'Hochwasserschutz', '2025-01-01', NULL, 4500000);
CREATE TABLE mitarbeiter_bau (id INTEGER PRIMARY KEY, name TEXT NOT NULL, rolle TEXT NOT NULL, stundensatz REAL NOT NULL, eingestellt TEXT NOT NULL);
INSERT INTO mitarbeiter_bau VALUES (1, 'Karl Schneider', 'Projektleiter', 120.00, '2020-01-01'), (2, 'Iris Meier', 'Architektin', 95.00, '2021-03-15'), (3, 'Tom Wagner', 'Bauingenieur', 85.00, '2022-06-01'), (4, 'Svenja Koch', 'Bauzeichnerin', 65.00, '2023-02-01'), (5, 'Felix Brandt', 'Bauleiter', 90.00, '2021-09-01'), (6, 'Nina Richter', 'Kalkulatorin', 75.00, '2022-11-01'), (7, 'Lukas Fuchs', 'Praktikant', 35.00, '2025-01-01');
CREATE TABLE arbeitsstunden (id INTEGER PRIMARY KEY, mitarbeiter_id INTEGER NOT NULL, projekt_id INTEGER NOT NULL, stunden REAL NOT NULL, datum TEXT NOT NULL, FOREIGN KEY (mitarbeiter_id) REFERENCES mitarbeiter_bau(id), FOREIGN KEY (projekt_id) REFERENCES projekte(id));
INSERT INTO arbeitsstunden VALUES
  (1, 1, 1, 40, '2025-01-06'), (2, 2, 1, 38, '2025-01-06'), (3, 3, 1, 42, '2025-01-06'), (4, 4, 2, 40, '2025-01-06'), (5, 5, 2, 39, '2025-01-06'),
  (6, 1, 2, 20, '2025-01-13'), (7, 2, 3, 40, '2025-01-13'), (8, 3, 3, 42, '2025-01-13'), (9, 5, 3, 38, '2025-01-13'), (10, 4, 2, 36, '2025-01-13'),
  (11, 1, 3, 40, '2025-01-20'), (12, 2, 1, 35, '2025-01-20'), (13, 3, 1, 40, '2025-01-20'), (14, 5, 1, 42, '2025-01-20'), (15, 6, 2, 40, '2025-01-20'),
  (16, 6, 3, 38, '2025-01-27'), (17, 7, 1, 20, '2025-01-27'), (18, 4, 3, 35, '2025-01-27'), (19, 1, 4, 40, '2025-02-03'), (20, 5, 4, 38, '2025-02-03'),
  (21, 3, 4, 30, '2025-02-03'), (22, 2, 4, 25, '2025-02-03'), (23, 1, 5, 40, '2025-02-10'), (24, 5, 5, 35, '2025-02-10'), (25, 6, 5, 42, '2025-02-10'),
  (26, 1, 1, 40, '2025-02-17'), (27, 2, 1, 38, '2025-02-17'), (28, 3, 1, 42, '2025-02-17'), (29, 5, 1, 40, '2025-02-17'), (30, 7, 1, 25, '2025-02-17');
`;

export const DEFAULT_CHALLENGES = [
  {
    id: 'abitur-q1-select',
    title: 'Q1 SQL-SELECT Übungen',
    difficulty: 'medium',
    tags: ['SELECT', 'WHERE', 'JOIN', 'GROUP BY', 'Subquery', 'Abitur'],
    description: 'Abitur-Training NRW: SELECT-Queries für den Q1-Lehrplan. Alle Aufgaben basieren auf dem Schuldatenbank-Schema (schueler, faecher, noten, lehrer, unterrichtet).',
    defaultSeed: T,
    tasks: [
      /* ── Grundlagen (10 Aufgaben) ── */
      {
        id: 'ab-01', title: 'Alle Schüler',
        markdown: 'Zeige **alle Spalten** der Tabelle `schueler` an.',
        seed: T, check: { type: 'result', expectedSql: 'SELECT * FROM schueler' },
        sql: 'SELECT * FROM schueler;', hint: 'Verwende SELECT * FROM schueler',
        checklist: ['Alle 15 Schüler werden angezeigt', 'Alle Spalten sind enthalten'],
      },
      {
        id: 'ab-02', title: 'Namen und Klassen',
        markdown: 'Zeige **nur** die Spalten `name` und `klasse` aus der Tabelle `schueler` an.',
        seed: T, check: { type: 'result', expectedSql: 'SELECT name, klasse FROM schueler' },
        sql: 'SELECT name, klasse FROM schueler;', hint: 'Wähle nur die beiden Spalten aus',
        checklist: ['Nur name und klasse werden angezeigt'],
      },
      {
        id: 'ab-03', title: 'Schüler der Q1',
        markdown: 'Zeige **alle Spalten** der Schüler an, die in der Klasse `Q1` sind.',
        seed: T, check: { type: 'result', expectedSql: 'SELECT * FROM schueler WHERE klasse = \'Q1\'' },
        sql: "SELECT * FROM schueler WHERE klasse = 'Q1';", hint: 'Verwende WHERE klasse = \'Q1\'',
        checklist: ['Nur Schüler der Q1 werden angezeigt'],
      },
      {
        id: 'ab-04', title: 'Noten über 3.0',
        markdown: 'Zeige alle Noten aus der Tabelle `noten` an, die **besser als 3.0** sind (also < 3.0).',
        seed: T, check: { type: 'result', expectedSql: 'SELECT * FROM noten WHERE note < 3.0' },
        sql: 'SELECT * FROM noten WHERE note < 3.0;', hint: 'Verwende WHERE note < 3.0',
        checklist: ['Nur Noten besser als 3.0'],
      },
      {
        id: 'ab-05', title: 'Bestimmte Spalten mit ORDER BY',
        markdown: 'Zeige `name` und `geburtsdatum` aller Schüler an, sortiert **absteigend** nach Geburtsdatum (jüngste zuerst).',
        seed: T, check: { type: 'result', expectedSql: 'SELECT name, geburtsdatum FROM schueler ORDER BY geburtsdatum DESC' },
        sql: 'SELECT name, geburtsdatum FROM schueler ORDER BY geburtsdatum DESC;', hint: 'Verwende ORDER BY geburtsdatum DESC',
        checklist: ['Sortiert absteigend nach geburtsdatum'],
      },
      {
        id: 'ab-06', title: 'DISTINCT Klassen',
        markdown: 'Zeige **alle vorhandenen Klassen** aus der Tabelle `schueler` an — jede Klasse nur einmal.',
        seed: T, check: { type: 'result', expectedSql: 'SELECT DISTINCT klasse FROM schueler' },
        sql: 'SELECT DISTINCT klasse FROM schueler;', hint: 'Verwende SELECT DISTINCT klasse',
        checklist: ['Jede Klasse erscheint nur einmal'],
      },
      {
        id: 'ab-07', title: 'LIKE: Namen mit "mann"',
        markdown: 'Finde alle Lehrer, deren Name die Zeichenfolge `mann` enthält (verwende `LIKE`). Zeige alle Spalten.',
        seed: T, check: { type: 'result', expectedSql: "SELECT * FROM lehrer WHERE name LIKE '%mann%'" },
        sql: "SELECT * FROM lehrer WHERE name LIKE '%mann%';", hint: 'Verwende LIKE \'%mann%\'',
        checklist: ['Nur Lehrer mit "mann" im Namen (Zimmermann, Hartmann, Lehmann)'],
      },
      {
        id: 'ab-08', title: 'IN: Bestimmte Fächer',
        markdown: 'Zeige alle Fächer an, deren Kürzel in (`M`, `D`, `E`) ist. Gib alle Spalten aus.',
        seed: T, check: { type: 'result', expectedSql: "SELECT * FROM faecher WHERE kuerzel IN ('M', 'D', 'E')" },
        sql: "SELECT * FROM faecher WHERE kuerzel IN ('M', 'D', 'E');", hint: 'Verwende WHERE kuerzel IN (...)',
        checklist: ['Nur Mathematik, Deutsch, Englisch'],
      },
      {
        id: 'ab-09', title: 'BETWEEN: Geburtsdatum',
        markdown: 'Zeige alle Schüler an, die **zwischen** dem 01.01.2007 und dem 31.12.2007 geboren wurden. Gib `name` und `geburtsdatum` aus.',
        seed: T, check: { type: 'result', expectedSql: "SELECT name, geburtsdatum FROM schueler WHERE geburtsdatum BETWEEN '2007-01-01' AND '2007-12-31'" },
        sql: "SELECT name, geburtsdatum FROM schueler WHERE geburtsdatum BETWEEN '2007-01-01' AND '2007-12-31';", hint: 'Verwende BETWEEN mit Datumswerten',
        checklist: ['Nur Schüler mit Geburtsdatum in 2007'],
      },
      {
        id: 'ab-10', title: 'LIMIT + ORDER BY',
        markdown: 'Zeige die **3 jüngsten** Schüler an (name, geburtsdatum).',
        seed: T, check: { type: 'result', expectedSql: 'SELECT name, geburtsdatum FROM schueler ORDER BY geburtsdatum DESC LIMIT 3' },
        sql: 'SELECT name, geburtsdatum FROM schueler ORDER BY geburtsdatum DESC LIMIT 3;', hint: 'Kombiniere ORDER BY DESC mit LIMIT 3',
        checklist: ['Nur 3 Zeilen', 'Die jüngsten Schüler'],
      },

      /* ── Aggregate & Gruppierung (7 Aufgaben) ── */
      {
        id: 'ab-11', title: 'Anzahl der Schüler',
        markdown: 'Wie viele Schüler sind in der Tabelle `schueler`? Zeige eine Spalte mit dem Namen `anzahl`.',
        seed: T, check: { type: 'result', expectedSql: 'SELECT COUNT(*) AS anzahl FROM schueler' },
        sql: 'SELECT COUNT(*) AS anzahl FROM schueler;', hint: 'Verwende COUNT(*)',
        checklist: ['Ergebnis: 15'],
      },
      {
        id: 'ab-12', title: 'Durchschnittsnote pro Fach',
        markdown: 'Berechne die **durchschnittliche Note** pro Fach. Zeige `fach_id` und `avg_note` (gerundet auf 2 Dezimalstellen).',
        seed: T, check: { type: 'result', expectedSql: 'SELECT fach_id, ROUND(AVG(note), 2) AS avg_note FROM noten GROUP BY fach_id' },
        sql: 'SELECT fach_id, ROUND(AVG(note), 2) AS avg_note FROM noten GROUP BY fach_id;', hint: 'Verwende GROUP BY fach_id und AVG(note)',
        checklist: ['Gruppiert nach fach_id', 'Durchschnitt gerundet auf 2 Stellen'],
      },
      {
        id: 'ab-13', title: 'Noten MIN/MAX',
        markdown: 'Ermittle für jedes Fach die **beste (MIN)** und **schlechteste (MAX)** Note. Zeige `fach_id`, `beste_note`, `schlechteste_note`.',
        seed: T, check: { type: 'result', expectedSql: 'SELECT fach_id, MIN(note) AS beste_note, MAX(note) AS schlechteste_note FROM noten GROUP BY fach_id' },
        sql: 'SELECT fach_id, MIN(note) AS beste_note, MAX(note) AS schlechteste_note FROM noten GROUP BY fach_id;', hint: 'Verwende MIN(note) und MAX(note)',
        checklist: ['Pro Fach die beste und schlechteste Note'],
      },
      {
        id: 'ab-14', title: 'HAVING: Fächer mit Durchschnitt > 3.0',
        markdown: 'Zeige nur die Fächer (`fach_id`) an, deren **durchschnittliche Note schlechter als 3.0 ist** (avg > 3.0).',
        seed: T, check: { type: 'result', expectedSql: 'SELECT fach_id, AVG(note) AS avg_note FROM noten GROUP BY fach_id HAVING avg_note > 3.0' },
        sql: 'SELECT fach_id, AVG(note) AS avg_note FROM noten GROUP BY fach_id HAVING AVG(note) > 3.0;', hint: 'Verwende HAVING nach GROUP BY',
        checklist: ['Nur Fächer mit Durchschnitt > 3.0'],
      },
      {
        id: 'ab-15', title: 'Anzahl Noten pro Schüler',
        markdown: 'Zeige für jeden Schüler (`schueler_id`) die **Anzahl der Noten** an, die er erhalten hat. Sortiere absteigend nach Anzahl.',
        seed: T, check: { type: 'result', expectedSql: 'SELECT schueler_id, COUNT(*) AS anzahl FROM noten GROUP BY schueler_id ORDER BY anzahl DESC' },
        sql: 'SELECT schueler_id, COUNT(*) AS anzahl FROM noten GROUP BY schueler_id ORDER BY anzahl DESC;', hint: 'GROUP BY schueler_id, ORDER BY COUNT(*) DESC',
        checklist: ['Gruppiert nach schueler_id', 'Absteigend sortiert nach Anzahl'],
      },
      {
        id: 'ab-16', title: 'SUM der Noten',
        markdown: 'Berechne die **Summe aller Noten** in der Tabelle noten. Zeige sie als `gesamt_note` an.',
        seed: T, check: { type: 'result', expectedSql: 'SELECT SUM(note) AS gesamt_note FROM noten' },
        sql: 'SELECT SUM(note) AS gesamt_note FROM noten;', hint: 'Verwende SUM(note)',
        checklist: ['Einzige Zeile mit der Summe'],
      },
      {
        id: 'ab-17', title: 'Durchschnittsnote aller Q1-Schüler',
        markdown: 'Berechne die **durchschnittliche Note** aller Schüler aus der **Q1**. Nutze einen JOIN zwischen `noten` und `schueler`.',
        seed: T, check: { type: 'result', expectedSql: "SELECT ROUND(AVG(n.note), 2) AS avg_q1 FROM noten n JOIN schueler s ON n.schueler_id = s.id WHERE s.klasse = 'Q1'" },
        sql: "SELECT ROUND(AVG(n.note), 2) AS avg_q1 FROM noten n JOIN schueler s ON n.schueler_id = s.id WHERE s.klasse = 'Q1';", hint: 'JOIN noten mit schueler, dann WHERE klasse = \'Q1\'',
        checklist: ['Nur Q1-Schüler', 'Durchschnitt gerundet'],
      },

      /* ── Joins (6 Aufgaben) ── */
      {
        id: 'ab-18', title: 'INNER JOIN: Noten mit Schülernamen',
        markdown: 'Zeige alle Noten an — aber statt der `schueler_id` soll der **Name des Schülers** erscheinen. Gib aus: `name`, `fach_id`, `note`.',
        seed: T, check: { type: 'result', expectedSql: 'SELECT s.name, n.fach_id, n.note FROM noten n JOIN schueler s ON n.schueler_id = s.id' },
        sql: 'SELECT s.name, n.fach_id, n.note FROM noten n JOIN schueler s ON n.schueler_id = s.id;', hint: 'JOIN noten mit schueler ON schueler_id = id',
        checklist: ['JOIN zwischen noten und schueler', 'name statt schueler_id'],
      },
      {
        id: 'ab-19', title: 'Drei-Tabellen-Join: Schüler – Noten – Fächer',
        markdown: 'Zeige den **Schülernamen**, die **Fachbezeichnung** und die **Note** an. Verwende einen Drei-Tabellen-JOIN.',
        seed: T, check: { type: 'result', expectedSql: 'SELECT s.name, f.bezeichnung, n.note FROM noten n JOIN schueler s ON n.schueler_id = s.id JOIN faecher f ON n.fach_id = f.id' },
        sql: 'SELECT s.name, f.bezeichnung, n.note FROM noten n JOIN schueler s ON n.schueler_id = s.id JOIN faecher f ON n.fach_id = f.id;', hint: 'Verkette zwei JOINs: noten → schueler und noten → faecher',
        checklist: ['Drei-Tabellen-JOIN', 'Schülername und Fachbezeichnung'],
      },
      {
        id: 'ab-20', title: 'LEFT JOIN: Lehrer ohne Unterricht',
        markdown: 'Zeige alle Lehrer und die Fächer, die sie unterrichten. Verwende `LEFT JOIN`, so dass **auch Lehrer ohne Fächer** erscheinen. Gib `lehrer.name` und `faecher.bezeichnung` aus.',
        seed: T, check: { type: 'result', expectedSql: 'SELECT l.name, f.bezeichnung FROM lehrer l LEFT JOIN unterrichtet u ON l.id = u.lehrer_id LEFT JOIN faecher f ON u.fach_id = f.id' },
        sql: 'SELECT l.name, f.bezeichnung FROM lehrer l LEFT JOIN unterrichtet u ON l.id = u.lehrer_id LEFT JOIN faecher f ON u.fach_id = f.id;', hint: 'LEFT JOIN von lehrer zu unterrichtet zu faecher',
        checklist: ['LEFT JOIN, nicht INNER JOIN', 'Alle Lehrer sind enthalten'],
      },
      {
        id: 'ab-21', title: 'Anzahl unterrichteter Fächer pro Lehrer',
        markdown: 'Zeige für jeden Lehrer die **Anzahl der Fächer**, die er unterrichtet. Gib `lehrer.name` und `anzahl_faecher` aus. Sortiere absteigend nach Anzahl.',
        seed: T, check: { type: 'result', expectedSql: 'SELECT l.name, COUNT(u.fach_id) AS anzahl_faecher FROM lehrer l LEFT JOIN unterrichtet u ON l.id = u.lehrer_id GROUP BY l.id ORDER BY anzahl_faecher DESC' },
        sql: 'SELECT l.name, COUNT(u.fach_id) AS anzahl_faecher FROM lehrer l LEFT JOIN unterrichtet u ON l.id = u.lehrer_id GROUP BY l.id ORDER BY anzahl_faecher DESC;', hint: 'LEFT JOIN + GROUP BY + COUNT',
        checklist: ['LEFT JOIN für Lehrer ohne Fächer', 'Gruppiert nach Lehrer', 'Absteigend sortiert'],
      },
      {
        id: 'ab-22', title: 'Selbst-Join: Fächer mit gleichem Kürzelanfang',
        markdown: 'Finde **Paare von Fächern**, die mit demselben **Buchstaben** beginnen. Vermeide Paare, bei denen ein Fach mit sich selbst verglichen wird. Zeige `f1.bezeichnung` und `f2.bezeichnung`.',
        seed: T, check: { type: 'contains', tokens: ['SELECT', 'FROM faecher', 'JOIN faecher', 'ON', 'SUBSTR'] },
        sql: "SELECT f1.bezeichnung, f2.bezeichnung FROM faecher f1 JOIN faecher f2 ON SUBSTR(f1.kuerzel, 1, 1) = SUBSTR(f2.kuerzel, 1, 1) AND f1.id <> f2.id;", hint: 'Verwende einen Selbst-Join mit SUBSTR()',
        checklist: ['Selbst-Join auf faecher', 'Vermeidet Paare mit sich selbst'],
      },
      {
        id: 'ab-23', title: 'Lehrer ihrer unterrichteten Fächer',
        markdown: 'Zeige den **Lehrernamen** und die **Kürzel der Fächer**, die er unterrichtet. Sortiere alphabetisch nach Lehrername.',
        seed: T, check: { type: 'result', expectedSql: 'SELECT l.name, f.kuerzel FROM lehrer l JOIN unterrichtet u ON l.id = u.lehrer_id JOIN faecher f ON u.fach_id = f.id ORDER BY l.name' },
        sql: 'SELECT l.name, f.kuerzel FROM lehrer l JOIN unterrichtet u ON l.id = u.lehrer_id JOIN faecher f ON u.fach_id = f.id ORDER BY l.name;', hint: 'Drei-Tabellen-JOIN mit ORDER BY',
        checklist: ['Drei-Tabellen-JOIN', 'Sortiert nach Lehrername'],
      },

      /* ── Unterabfragen (4 Aufgaben) ── */
      {
        id: 'ab-24', title: 'Subquery mit IN',
        markdown: 'Zeige alle Schüler an, die **mindestens eine Note besser als 2.0** haben. Verwende eine **Subquery mit IN**.',
        seed: T, check: { type: 'result', expectedSql: "SELECT * FROM schueler WHERE id IN (SELECT schueler_id FROM noten WHERE note < 2.0)" },
        sql: "SELECT * FROM schueler WHERE id IN (SELECT schueler_id FROM noten WHERE note < 2.0);", hint: 'Subquery: SELECT schueler_id FROM noten WHERE note < 2.0',
        checklist: ['Subquery in WHERE', 'Schüler, die mindestens eine Note < 2.0 haben'],
      },
      {
        id: 'ab-25', title: 'Subquery in SELECT',
        markdown: 'Zeige für jeden Schüler den **Namen** und die **durchschnittliche Note** an. Verwende eine **skalare Subquery in SELECT**. Die durchschnittliche Note soll `avg_note` heißen.',
        seed: T, check: { type: 'result', expectedSql: 'SELECT s.name, (SELECT ROUND(AVG(note), 2) FROM noten WHERE schueler_id = s.id) AS avg_note FROM schueler s' },
        sql: 'SELECT s.name, (SELECT ROUND(AVG(note), 2) FROM noten n WHERE n.schueler_id = s.id) AS avg_note FROM schueler s;', hint: 'Subquery: (SELECT AVG(note) FROM noten WHERE schueler_id = s.id)',
        checklist: ['Korrelierte Subquery im SELECT', 'Durchschnitt pro Schüler'],
      },
      {
        id: 'ab-26', title: 'EXISTS: Schüler mit Note 1.0',
        markdown: 'Finde alle Schüler, die **mindestens eine Note 1.0** haben. Verwende `EXISTS`. Gib `name` und `klasse` aus.',
        seed: T, check: { type: 'result', expectedSql: "SELECT name, klasse FROM schueler WHERE EXISTS (SELECT 1 FROM noten WHERE schueler_id = schueler.id AND note = 1.0)" },
        sql: "SELECT s.name, s.klasse FROM schueler s WHERE EXISTS (SELECT 1 FROM noten n WHERE n.schueler_id = s.id AND n.note = 1.0);", hint: 'EXISTS (SELECT 1 FROM noten WHERE ...)',
        checklist: ['Verwendet EXISTS', 'Schüler mit mindestens einer 1.0'],
      },
      {
        id: 'ab-27', title: 'Subquery in FROM',
        markdown: 'Verwende eine **Subquery in FROM** (abgeleitete Tabelle), um die durchschnittliche Note pro Fach zu berechnen und dann nur Fächer mit einem Durchschnitt **besser als 2.5** zu zeigen.',
        seed: T, check: { type: 'contains', tokens: ['SELECT', 'FROM (', 'AVG', 'WHERE avg_note'] },
        sql: "SELECT f.bezeichnung, sub.avg_note FROM (SELECT fach_id, AVG(note) AS avg_note FROM noten GROUP BY fach_id) sub JOIN faecher f ON sub.fach_id = f.id WHERE sub.avg_note < 2.5;", hint: 'FROM (SELECT ...) AS sub JOIN ...',
        checklist: ['Subquery in FROM', 'JOIN mit abgeleiteter Tabelle'],
      },

      /* ── Fortgeschritten (3 Aufgaben) ── */
      {
        id: 'ab-28', title: 'COALESCE / IFNULL',
        markdown: 'Da alle Werte in der Datenbank ausgefüllt sind, nehmen wir an: Zeige eine Liste aller **Fächer** und **Lehrer**. Verwende einen LEFT JOIN. Falls ein Fach von keinem Lehrer unterrichtet wird, zeige `"Kein Lehrer"` mit `COALESCE()` oder `IFNULL()`.',
        seed: T, check: { type: 'contains', tokens: ['SELECT', 'LEFT JOIN', 'COALESCE', 'IFNULL'] },
        sql: "SELECT f.bezeichnung, COALESCE(l.name, 'Kein Lehrer') AS lehrer FROM faecher f LEFT JOIN unterrichtet u ON f.id = u.fach_id LEFT JOIN lehrer l ON u.lehrer_id = l.id;", hint: 'COALESCE(lehrer.name, \'Kein Lehrer\')',
        checklist: ['LEFT JOIN', 'COALESCE oder IFNULL für NULL-Werte'],
      },
      {
        id: 'ab-29', title: 'CASE WHEN: Noten in Worte',
        markdown: 'Zeige die Noten mit einer **zusätzlichen Spalte `bewertung`** an, die die Note in Worte fasst:\n- `note <= 1.5` → "sehr gut"\n- `note <= 3.0` → "befriedigend"\n- `note <= 4.0` → "ausreichend"\n- sonst → "mangelhaft"\n\nZeige `schueler_id`, `fach_id`, `note`, `bewertung`.',
        seed: T, check: { type: 'contains', tokens: ['SELECT', 'CASE WHEN', 'END'] },
        sql: "SELECT schueler_id, fach_id, note,\n  CASE\n    WHEN note <= 1.5 THEN 'sehr gut'\n    WHEN note <= 3.0 THEN 'befriedigend'\n    WHEN note <= 4.0 THEN 'ausreichend'\n    ELSE 'mangelhaft'\n  END AS bewertung\nFROM noten;", hint: 'CASE WHEN note <= 1.5 THEN \'sehr gut\' ... END',
        checklist: ['CASE WHEN mit mehreren Bedingungen', 'Neue Spalte bewertung'],
      },
      {
        id: 'ab-30', title: 'String-Funktionen',
        markdown: 'Zeige alle Schülernamen in **Großbuchstaben** (`UPPER`) an. Füge eine zweite Spalte hinzu, die die **Länge** (`LENGTH`) des Namens enthält. Nenne die Spalten `name_gross` und `laenge`.',
        seed: T, check: { type: 'result', expectedSql: "SELECT UPPER(name) AS name_gross, LENGTH(name) AS laenge FROM schueler" },
        sql: "SELECT UPPER(name) AS name_gross, LENGTH(name) AS laenge FROM schueler;", hint: 'UPPER(name) und LENGTH(name)',
        checklist: ['UPPER-Funktion', 'LENGTH-Funktion', 'Aliase name_gross und laenge'],
      },
    ],
  },
  {
    id: 'fensterfunktionen',
    title: 'Fensterfunktionen — RANK, ROW_NUMBER & OVER',
    difficulty: 'hard',
    tags: ['Window Functions', 'RANK', 'ROW_NUMBER', 'OVER', 'PARTITION BY'],
    description: 'Vertiefung in SQL-Fensterfunktionen anhand eines Verkaufsdatensatzes. Von einfachen Rankings bis zur komplexen gleitenden Analyse.',
    defaultSeed: SEED_SALES,
    tasks: [
      {
        id: 'wf-01', title: 'ROW_NUMBER: Zeilen nummerieren',
        markdown: 'Nummeriere **alle Verkäufe** fortlaufend nach `umsatz` absteigend. Zeige `id`, `mitarbeiter_id`, `umsatz` und eine Spalte `rang` mit `ROW_NUMBER()`.',
        seed: SEED_SALES, check: { type: 'result', expectedSql: 'SELECT id, mitarbeiter_id, umsatz, ROW_NUMBER() OVER (ORDER BY umsatz DESC) AS rang FROM verkaeufe' },
        sql: 'SELECT id, mitarbeiter_id, umsatz, ROW_NUMBER() OVER (ORDER BY umsatz DESC) AS rang FROM verkaeufe;', hint: 'ROW_NUMBER() OVER (ORDER BY ...)',
        checklist: ['ROW_NUMBER()-Spalte', 'Sortiert nach umsatz absteigend'],
      },
      {
        id: 'wf-02', title: 'RANK: Mit gleichen Werten',
        markdown: 'Erstelle ein **Ranking** der Verkäufe nach `umsatz` absteigend mit `RANK()`. Zeige `id`, `umsatz` und `rang`. Bei gleichem Umsatz sollen dieselben Ränge vergeben werden.',
        seed: SEED_SALES, check: { type: 'result', expectedSql: 'SELECT id, umsatz, RANK() OVER (ORDER BY umsatz DESC) AS rang FROM verkaeufe' },
        sql: 'SELECT id, umsatz, RANK() OVER (ORDER BY umsatz DESC) AS rang FROM verkaeufe;', hint: 'RANK() statt ROW_NUMBER()',
        checklist: ['RANK()-Funktion', 'Gleicher Rang bei gleichem Umsatz'],
      },
      {
        id: 'wf-03', title: 'PARTITION BY: Ranking pro Abteilung',
        markdown: 'Ranke die Verkäufe **pro Mitarbeiter** (nicht global). Zeige `mitarbeiter_id`, `umsatz`, `datum` und eine Spalte `mitarbeiter_rang` — der Rang des Umsatzes **innerhalb** des jeweiligen Mitarbeiters (höchster Umsatz = Rang 1).',
        seed: SEED_SALES, check: { type: 'result', expectedSql: 'SELECT mitarbeiter_id, umsatz, datum, ROW_NUMBER() OVER (PARTITION BY mitarbeiter_id ORDER BY umsatz DESC) AS mitarbeiter_rang FROM verkaeufe' },
        sql: 'SELECT mitarbeiter_id, umsatz, datum, ROW_NUMBER() OVER (PARTITION BY mitarbeiter_id ORDER BY umsatz DESC) AS mitarbeiter_rang FROM verkaeufe;', hint: 'ROW_NUMBER() OVER (PARTITION BY mitarbeiter_id ORDER BY ...)',
        checklist: ['PARTITION BY mitarbeiter_id', 'Ranking pro Mitarbeiter'],
      },
      {
        id: 'wf-04', title: 'Top-3-Verkaeufe pro Mitarbeiter',
        markdown: 'Erweitere die vorherige Aufgabe: Zeige nur die **Top 3 Verkäufe** (nach umsatz) **pro Mitarbeiter** an. Verwende eine Subquery oder CTE mit `ROW_NUMBER()`. Gib `mitarbeiter_id`, `umsatz`, `datum` und `rang` aus.',
        seed: SEED_SALES, check: { type: 'result', expectedSql: "SELECT mitarbeiter_id, umsatz, datum, rang FROM (SELECT mitarbeiter_id, umsatz, datum, ROW_NUMBER() OVER (PARTITION BY mitarbeiter_id ORDER BY umsatz DESC) AS rang FROM verkaeufe) WHERE rang <= 3" },
        sql: "SELECT mitarbeiter_id, umsatz, datum, rang FROM (SELECT mitarbeiter_id, umsatz, datum, ROW_NUMBER() OVER (PARTITION BY mitarbeiter_id ORDER BY umsatz DESC) AS rang FROM verkaeufe) WHERE rang <= 3;", hint: 'Subquery mit ROW_NUMBER() im FROM, dann WHERE rang <= 3',
        checklist: ['Subquery oder CTE', 'WHERE rang <= 3', 'Nur Top 3 pro Mitarbeiter'],
      },
      {
        id: 'wf-05', title: 'SUM() OVER: Kumulierte Summe',
        markdown: 'Berechne für jeden Verkauf die **kumulierte Summe des Umsatzes** über die Zeit (aufsteigend nach Datum). Zeige `datum`, `umsatz` und eine Spalte `kumuliert` mit der fortlaufenden Summe.',
        seed: SEED_SALES, check: { type: 'result', expectedSql: 'SELECT datum, umsatz, SUM(umsatz) OVER (ORDER BY datum) AS kumuliert FROM verkaeufe' },
        sql: 'SELECT datum, umsatz, SUM(umsatz) OVER (ORDER BY datum) AS kumuliert FROM verkaeufe;', hint: 'SUM(umsatz) OVER (ORDER BY datum)',
        checklist: ['SUM() OVER mit ORDER BY', 'Kumulierte Summe'],
      },
      {
        id: 'wf-06', title: 'Durchschnitt vs Einzelwert — komplexe Analyse',
        markdown: 'Erstelle eine **komplexe Analyse**: Zeige für jeden Verkauf:\n- `mitarbeiter_id`\n- `produkt_id`\n- `umsatz`\n- `avg_umsatz_mitarbeiter` = Durchschnitts-Umsatz dieses Mitarbeiters (über alle seine Verkäufe)\n- `abweichung` = umsatz − avg_umsatz_mitarbeiter\n- `rang_mitarbeiter` = Rang des Umsatzes innerhalb des Mitarbeiters\n\nSortiere nach Mitarbeiter und absteigendem Umsatz. **Verwende Fensterfunktionen, KEINE Subquery für den Durchschnitt.**',
        seed: SEED_SALES, check: { type: 'result', expectedSql: 'SELECT mitarbeiter_id, produkt_id, umsatz, AVG(umsatz) OVER (PARTITION BY mitarbeiter_id) AS avg_umsatz_mitarbeiter, umsatz - AVG(umsatz) OVER (PARTITION BY mitarbeiter_id) AS abweichung, ROW_NUMBER() OVER (PARTITION BY mitarbeiter_id ORDER BY umsatz DESC) AS rang_mitarbeiter FROM verkaeufe ORDER BY mitarbeiter_id, umsatz DESC' },
        sql: 'SELECT mitarbeiter_id, produkt_id, umsatz, AVG(umsatz) OVER (PARTITION BY mitarbeiter_id) AS avg_umsatz_mitarbeiter, umsatz - AVG(umsatz) OVER (PARTITION BY mitarbeiter_id) AS abweichung, ROW_NUMBER() OVER (PARTITION BY mitarbeiter_id ORDER BY umsatz DESC) AS rang_mitarbeiter FROM verkaeufe ORDER BY mitarbeiter_id, umsatz DESC;', hint: 'AVG() OVER (PARTITION BY ...) für den Durchschnitt, dann den Rang berechnen',
        checklist: ['AVG() OVER (PARTITION BY)', 'Abweichung berechnet', 'Rang pro Mitarbeiter', 'Sortiert'],
      },
    ],
  },
  {
    id: 'rekursive-ctes',
    title: 'Rekursive CTEs — Hierarchien & Graphen',
    difficulty: 'hard',
    tags: ['WITH RECURSIVE', 'CTE', 'Hierarchie', 'Graph'],
    description: 'Rekursive Abfragen mit WITH RECURSIVE. Vom einfachen Organigramm bis zur vollständigen Hierarchie-Auflösung mit Ebenenberechnung.',
    defaultSeed: TE,
    tasks: [
      {
        id: 'rc-01', title: 'Einfache CTE',
        markdown: 'Erstelle eine **nicht-rekursive CTE** namens `chefs`, die alle Mitarbeiter anzeigt, die **keinen Vorgesetzten** haben (`manager_id IS NULL`). Zeige alle Spalten.',
        seed: TE, check: { type: 'result', expectedSql: "WITH chefs AS (SELECT * FROM employees WHERE manager_id IS NULL) SELECT * FROM chefs" },
        sql: 'WITH chefs AS (SELECT * FROM employees WHERE manager_id IS NULL) SELECT * FROM chefs;', hint: 'WITH name AS (SELECT ...) SELECT ...',
        checklist: ['CTE verwendet', 'Nur Mitarbeiter ohne Vorgesetzten'],
      },
      {
        id: 'rc-02', title: 'Rekursive CTE: Ebene 1',
        markdown: 'Verwende `WITH RECURSIVE` um die **Hierarchiestufe 1** (direkte Untergebene von Zara) zu finden. Der Anker (`UNION ALL`-Teil) ist Zara selbst. Der rekursive Teil findet alle, deren `manager_id` auf die bereits gefundenen IDs verweist.\n\nZeige `id`, `name`, `manager_id`.',
        seed: TE, check: { type: 'result', expectedSql: 'WITH RECURSIVE org AS (SELECT id, name, manager_id FROM employees WHERE manager_id IS NULL UNION ALL SELECT e.id, e.name, e.manager_id FROM employees e JOIN org ON e.manager_id = org.id) SELECT id, name, manager_id FROM org' },
        sql: "WITH RECURSIVE org AS (SELECT id, name, manager_id FROM employees WHERE manager_id IS NULL UNION ALL SELECT e.id, e.name, e.manager_id FROM employees e JOIN org ON e.manager_id = org.id) SELECT id, name, manager_id FROM org;", hint: 'Anker: WHERE manager_id IS NULL, Rekursion: JOIN org ON e.manager_id = org.id',
        checklist: ['WITH RECURSIVE', 'UNION ALL', 'Alle Mitarbeiter in der Hierarchie'],
      },
      {
        id: 'rc-03', title: 'Hierarchie-Ebene berechnen',
        markdown: 'Erweitere die rekursive CTE um eine **Ebenenspalte `ebene`** (0 für Zara, 1 für ihre direkten Untergebenen, 2 für deren Untergebene, usw.). Zeige `name` und `ebene`.',
        seed: TE, check: { type: 'result', expectedSql: "WITH RECURSIVE org AS (SELECT id, name, manager_id, 0 AS ebene FROM employees WHERE manager_id IS NULL UNION ALL SELECT e.id, e.name, e.manager_id, org.ebene + 1 FROM employees e JOIN org ON e.manager_id = org.id) SELECT name, ebene FROM org ORDER BY ebene, name" },
        sql: "WITH RECURSIVE org AS (SELECT id, name, manager_id, 0 AS ebene FROM employees WHERE manager_id IS NULL UNION ALL SELECT e.id, e.name, e.manager_id, org.ebene + 1 FROM employees e JOIN org ON e.manager_id = org.id) SELECT name, ebene FROM org ORDER BY ebene, name;", hint: 'Im Anker: 0 AS ebene. In der Rekursion: org.ebene + 1',
        checklist: ['Ebenenspalte', 'Ebene 0 = Chef', 'Inkrement pro Stufe'],
      },
      {
        id: 'rc-04', title: 'Hierarchie-Pfad',
        markdown: 'Erweitere die rekursive CTE um einen **Pfad** der Namen. Zeige `name`, `ebene` und `pfad` (z.B. "Zara → Ben → Diana"). Verwende `||` zur Verkettung.',
        seed: TE, check: { type: 'contains', tokens: ['WITH RECURSIVE', 'UNION ALL', 'pfad', '||', 'ORDER BY'] },
        sql: "WITH RECURSIVE org AS (SELECT id, name, manager_id, 0 AS ebene, name AS pfad FROM employees WHERE manager_id IS NULL UNION ALL SELECT e.id, e.name, e.manager_id, org.ebene + 1, org.pfad || ' → ' || e.name FROM employees e JOIN org ON e.manager_id = org.id) SELECT name, ebene, pfad FROM org ORDER BY pfad;", hint: 'Pfad im Anker: name AS pfad, in der Rekursion: org.pfad || \' → \' || e.name',
        checklist: ['Pfad-Verkettung mit ||', 'Pfeil-Trennzeichen →'],
      },
      {
        id: 'rc-05', title: 'Komplex: Anzahl Untergebene pro Ebene',
        markdown: 'Erstelle eine Abfrage, die:\n1. Eine rekursive CTE mit Ebenen verwendet\n2. **Pro Ebene** die Anzahl der Mitarbeiter zählt\n3. Den **durchschnittlichen Pfad-Länge** pro Ebene berechnet\n4. Das Ergebnis sortiert nach Ebene\n\nZeige `ebene`, `anzahl_mitarbeiter`.',
        seed: TE, check: { type: 'result', expectedSql: "WITH RECURSIVE org AS (SELECT id, manager_id, 0 AS ebene FROM employees WHERE manager_id IS NULL UNION ALL SELECT e.id, e.manager_id, org.ebene + 1 FROM employees e JOIN org ON e.manager_id = org.id) SELECT ebene, COUNT(*) AS anzahl_mitarbeiter FROM org GROUP BY ebene ORDER BY ebene" },
        sql: "WITH RECURSIVE org AS (SELECT id, manager_id, 0 AS ebene FROM employees WHERE manager_id IS NULL UNION ALL SELECT e.id, e.manager_id, org.ebene + 1 FROM employees e JOIN org ON e.manager_id = org.id) SELECT ebene, COUNT(*) AS anzahl_mitarbeiter FROM org GROUP BY ebene ORDER BY ebene;", hint: 'CTE nur mit id, manager_id, ebene. Danach GROUP BY ebene.',
        checklist: ['Rekursive CTE', 'GROUP BY ebene', 'Anzahl pro Hierarchie-Ebene'],
      },
    ],
  },
  {
    id: 'bauprojekte',
    title: 'Bauprojekte — Komplexe Mehr-Tabellen-Analyse',
    difficulty: 'hard',
    tags: ['Multi-Table', 'Aggregation', 'Join', 'Subquery', 'CASE'],
    description: 'Komplexe SQL-Analysen auf einem Bauprojekt-Datensatz. Progressive Aufgaben von einfachen Abfragen bis zur hochkomplexen Projektanalyse mit Kosten, Auslastung und Abweichungen.',
    defaultSeed: SEED_BAU,
    tasks: [
      {
        id: 'bp-01', title: 'Gesamtkosten pro Projekt',
        markdown: 'Berechne die **Gesamtkosten pro Projekt** (Stunden × Stundensatz). Zeige `projekt_name` und `gesamtkosten` (gerundet auf 2 Dezimalstellen). Sortiere absteigend nach Kosten.',
        seed: SEED_BAU, check: { type: 'result', expectedSql: 'SELECT p.name AS projekt_name, ROUND(SUM(a.stunden * m.stundensatz), 2) AS gesamtkosten FROM projekte p JOIN arbeitsstunden a ON p.id = a.projekt_id JOIN mitarbeiter_bau m ON a.mitarbeiter_id = m.id GROUP BY p.id ORDER BY gesamtkosten DESC' },
        sql: 'SELECT p.name AS projekt_name, ROUND(SUM(a.stunden * m.stundensatz), 2) AS gesamtkosten FROM projekte p JOIN arbeitsstunden a ON p.id = a.projekt_id JOIN mitarbeiter_bau m ON a.mitarbeiter_id = m.id GROUP BY p.id ORDER BY gesamtkosten DESC;', hint: 'JOIN über projekte → arbeitsstunden → mitarbeiter_bau, dann SUM(stunden * stundensatz)',
        checklist: ['Drei-Tabellen-JOIN', 'SUM(stunden * stundensatz)', 'Gerundet', 'Sortiert'],
      },
      {
        id: 'bp-02', title: 'Mitarbeiter-Auslastung',
        markdown: 'Zeige für jeden Mitarbeiter die **Gesamtzahl der Stunden** und die **Anzahl verschiedener Projekte**, an denen er gearbeitet hat. Gib `name`, `gesamtstunden`, `projektanzahl` aus. Sortiere absteigend nach Gesamtstunden.',
        seed: SEED_BAU, check: { type: 'result', expectedSql: 'SELECT m.name, SUM(a.stunden) AS gesamtstunden, COUNT(DISTINCT a.projekt_id) AS projektanzahl FROM mitarbeiter_bau m JOIN arbeitsstunden a ON m.id = a.mitarbeiter_id GROUP BY m.id ORDER BY gesamtstunden DESC' },
        sql: 'SELECT m.name, SUM(a.stunden) AS gesamtstunden, COUNT(DISTINCT a.projekt_id) AS projektanzahl FROM mitarbeiter_bau m JOIN arbeitsstunden a ON m.id = a.mitarbeiter_id GROUP BY m.id ORDER BY gesamtstunden DESC;', hint: 'GROUP BY mitarbeiter, SUM(stunden), COUNT(DISTINCT projekt_id)',
        checklist: ['SUM(stunden)', 'COUNT(DISTINCT projekt_id)', 'Gruppiert und sortiert'],
      },
      {
        id: 'bp-03', title: 'Budget-Auslastung in Prozent',
        markdown: 'Berechne, wie viel Prozent des **Budgets** jedes Projekts bereits durch Arbeitsstunden **verbraucht** wurde.\n\nZeige `projekt_name`, `budget`, `verbraucht` (Kosten bisher), `prozent_verbraucht` (gerundet auf 1 Dezimalstelle).\n\nProjekte mit NULL als Enddatum sind noch aktiv. Sortiere absteigend nach Prozent.',
        seed: SEED_BAU, check: { type: 'result', expectedSql: "SELECT p.name AS projekt_name, p.budget, ROUND(SUM(a.stunden * m.stundensatz), 2) AS verbraucht, ROUND(SUM(a.stunden * m.stundensatz) / p.budget * 100, 1) AS prozent_verbraucht FROM projekte p JOIN arbeitsstunden a ON p.id = a.projekt_id JOIN mitarbeiter_bau m ON a.mitarbeiter_id = m.id GROUP BY p.id ORDER BY prozent_verbraucht DESC" },
        sql: "SELECT p.name AS projekt_name, p.budget, ROUND(SUM(a.stunden * m.stundensatz), 2) AS verbraucht, ROUND(SUM(a.stunden * m.stundensatz) / p.budget * 100, 1) AS prozent_verbraucht FROM projekte p JOIN arbeitsstunden a ON p.id = a.projekt_id JOIN mitarbeiter_bau m ON a.mitarbeiter_id = m.id GROUP BY p.id ORDER BY prozent_verbraucht DESC;", hint: 'SUM(stunden * stundensatz) / budget * 100',
        checklist: ['Budget-Vergleich in Prozent', 'Gerundet', 'Sortiert'],
      },
      {
        id: 'bp-04', title: 'CASE: Projekt-Status',
        markdown: 'Erstelle eine **Status-Spalte** mit `CASE WHEN`:\n- Wenn `enddatum` NULL ist → `"In Planung"`\n- Wenn `enddatum` in der Vergangenheit liegt (< "2025-06-01") → `"Abgeschlossen"`\n- Sonst → `"Aktiv"`\n\nZeige `name`, `startdatum`, `enddatum`, `status`. Sortiere nach Status und Name.',
        seed: SEED_BAU, check: { type: 'contains', tokens: ['SELECT', 'CASE WHEN', 'END', 'status'] },
        sql: "SELECT name, startdatum, enddatum, CASE WHEN enddatum IS NULL THEN 'In Planung' WHEN enddatum < '2025-06-01' THEN 'Abgeschlossen' ELSE 'Aktiv' END AS status FROM projekte ORDER BY status, name;", hint: 'CASE WHEN enddatum IS NULL THEN ... WHEN enddatum < ... THEN ... ELSE ... END',
        checklist: ['CASE WHEN mit IS NULL', 'Datum-Vergleich', 'Status-Spalte'],
      },
      {
        id: 'bp-05', title: 'Komplexe Projektanalyse (final)',
        markdown: 'Erstelle eine **umfassende Projektanalyse**. Für jedes Projekt berechne:\n- `projekt_name`\n- `gesamtkosten` (Summe stunden × stundensatz, gerundet)\n- `budget`\n- `abweichung` = gesamtkosten − budget (positiv = Überschreitung)\n- `anzahl_mitarbeiter` (verschiedene Mitarbeiter, die am Projekt gearbeitet haben)\n- `durchschnittsstunden_pro_tag` (Gesamtstunden / Anzahl verschiedener Tage, gerundet auf 1 Stelle)\n- `status` mit CASE (wie in Aufgabe bp-04)\n\nSortiere nach Abweichung absteigend (größte Überschreitung zuerst).\n\n**Tipp:** Verwende CTEs oder Subqueries zur Strukturierung.',
        seed: SEED_BAU, check: { type: 'result', expectedSql: "WITH kosten AS (SELECT a.projekt_id, SUM(a.stunden * m.stundensatz) AS gesamtkosten, COUNT(DISTINCT a.mitarbeiter_id) AS anzahl_mitarbeiter, SUM(a.stunden) AS gesamtstunden, COUNT(DISTINCT a.datum) AS anzahl_tage FROM arbeitsstunden a JOIN mitarbeiter_bau m ON a.mitarbeiter_id = m.id GROUP BY a.projekt_id) SELECT p.name AS projekt_name, ROUND(k.gesamtkosten, 2) AS gesamtkosten, p.budget, ROUND(k.gesamtkosten - p.budget, 2) AS abweichung, k.anzahl_mitarbeiter, ROUND(k.gesamtstunden * 1.0 / k.anzahl_tage, 1) AS durchschnittsstunden_pro_tag, CASE WHEN p.enddatum IS NULL THEN 'In Planung' WHEN p.enddatum < '2025-06-01' THEN 'Abgeschlossen' ELSE 'Aktiv' END AS status FROM projekte p JOIN kosten k ON p.id = k.projekt_id ORDER BY abweichung DESC" },
        sql: "WITH kosten AS (SELECT a.projekt_id, SUM(a.stunden * m.stundensatz) AS gesamtkosten, COUNT(DISTINCT a.mitarbeiter_id) AS anzahl_mitarbeiter, SUM(a.stunden) AS gesamtstunden, COUNT(DISTINCT a.datum) AS anzahl_tage FROM arbeitsstunden a JOIN mitarbeiter_bau m ON a.mitarbeiter_id = m.id GROUP BY a.projekt_id) SELECT p.name AS projekt_name, ROUND(k.gesamtkosten, 2) AS gesamtkosten, p.budget, ROUND(k.gesamtkosten - p.budget, 2) AS abweichung, k.anzahl_mitarbeiter, ROUND(k.gesamtstunden * 1.0 / k.anzahl_tage, 1) AS durchschnittsstunden_pro_tag, CASE WHEN p.enddatum IS NULL THEN 'In Planung' WHEN p.enddatum < '2025-06-01' THEN 'Abgeschlossen' ELSE 'Aktiv' END AS status FROM projekte p JOIN kosten k ON p.id = k.projekt_id ORDER BY abweichung DESC;", hint: 'CTE für die Aggregationen, dann JOIN mit projekte, CASE für Status',
        checklist: ['CTE für Zwischenaggregation', 'Gesamtkosten, Budget, Abweichung', 'Anzahl Mitarbeiter', 'Durchschnittsstunden pro Tag', 'Status mit CASE', 'Sortiert nach Abweichung'],
      },
    ],
  },
  {
    id: 'left-join-null',
    title: 'LEFT JOIN & NULL-Filter — Kunden ohne Bestellungen',
    difficulty: 'medium',
    tags: ['LEFT JOIN', 'NULL', 'WHERE', 'Datumsfilter'],
    description: 'Lerne, wie man mit LEFT JOIN und NULL-Filter Kunden findet, die bestimmte Kriterien nicht erfüllen — von einfachen Abfragen bis zur komplexen Datumsanalyse.',
    defaultSeed: SEED_MARCH_ORDERS,
    tasks: [
      {
        id: 'ljn-01', title: 'Alle Kunden anzeigen',
        markdown: 'Zeige **alle Spalten** der Tabelle `customers` an.',
        seed: SEED_MARCH_ORDERS, check: { type: 'result', expectedSql: 'SELECT * FROM customers' },
        sql: 'SELECT * FROM customers;', hint: 'SELECT * FROM customers',
        checklist: ['Alle 5 Kunden werden angezeigt'],
      },
      {
        id: 'ljn-02', title: 'LEFT JOIN: Kunden mit Bestellungen',
        markdown: 'Führe einen `LEFT JOIN` zwischen `customers` und `orders` aus. Zeige **alle Kunden** an — auch solche ohne Bestellung. Gib `customers.name` und `orders.id` (als `bestell_id`) aus.\n\nKunden ohne Bestellung haben in der Spalte `bestell_id` den Wert NULL.',
        seed: SEED_MARCH_ORDERS, check: { type: 'result', expectedSql: 'SELECT c.name, o.id AS bestell_id FROM customers c LEFT JOIN orders o ON c.id = o.customer_id' },
        sql: 'SELECT c.name, o.id AS bestell_id FROM customers c LEFT JOIN orders o ON c.id = o.customer_id;', hint: 'LEFT JOIN orders ON customers.id = orders.customer_id',
        checklist: ['LEFT JOIN verwendet', 'Alle Kunden sind enthalten', 'Kunden ohne Bestellung haben NULL'],
      },
      {
        id: 'ljn-03', title: 'Kunden ganz ohne Bestellungen',
        markdown: 'Finde alle Kunden, die **niemals** eine Bestellung aufgegeben haben. Verwende `LEFT JOIN` und filtere mit `WHERE ... IS NULL`.\n\nZeige `id`, `name`, `email` — sortiert nach `id` aufsteigend.',
        seed: SEED_MARCH_ORDERS, check: { type: 'result', expectedSql: 'SELECT c.id, c.name, c.email FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.id IS NULL ORDER BY c.id' },
        sql: 'SELECT c.id, c.name, c.email FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.id IS NULL ORDER BY c.id;', hint: 'LEFT JOIN + WHERE o.id IS NULL — dann hast Du nur Kunden ohne Bestellung',
        checklist: ['LEFT JOIN', 'WHERE o.id IS NULL', 'Sortiert nach id'],
      },
      {
        id: 'ljn-04', title: 'Kunden ohne Bestellung im März 2023',
        markdown: 'Der Online-Shop möchte Kunden identifizieren, die **im März 2023 keine Bestellung** aufgegeben haben. Diese Kunden sollen einen Gutschein erhalten.\n\nFühre einen LEFT JOIN zwischen `customers` und `orders` durch, aber **beschränke die JOIN-Bedingung auf Bestellungen im März 2023** (Datum zwischen `2023-03-01` und `2023-03-31`).\n\nZeige `id`, `name`, `email` — nur Kunden **ohne** März-Bestellung. Sortiere nach `id` aufsteigend.\n\n**Wichtig:** Der Datumsfilter muss in der JOIN-Bedingung stehen (nicht im WHERE), sonst verlierst Du die Kunden ohne März-Bestellung!',
        seed: SEED_MARCH_ORDERS, check: { type: 'result', expectedSql: "SELECT c.id, c.name, c.email FROM customers c LEFT JOIN orders o ON c.id = o.customer_id AND o.order_date >= '2023-03-01' AND o.order_date <= '2023-03-31' WHERE o.id IS NULL ORDER BY c.id" },
        sql: "SELECT c.id, c.name, c.email FROM customers c LEFT JOIN orders o ON c.id = o.customer_id AND o.order_date BETWEEN '2023-03-01' AND '2023-03-31' WHERE o.id IS NULL ORDER BY c.id;", hint: 'Der Datumsfilter gehört ins ON (z.B. AND o.order_date BETWEEN ...), nicht ins WHERE. Erst dann LEFT JOIN + WHERE o.id IS NULL',
        checklist: ['LEFT JOIN mit Datumsfilter im ON', 'WHERE o.id IS NULL', 'Nur id, name, email', 'Sortiert nach id'],
      },
    ],
  },
];
