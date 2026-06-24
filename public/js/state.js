/**
 * Shared runtime state for the app.
 * @type {{
 *   db: any,
 *   sqlite3: any,
 *   dbName: string,
 *   editorView: any,
 *   tables: Array<{name: string, columns: Array<Record<string, unknown>>}>,
 *   refreshEditorSchema: null | ((tables: Array<{name: string, columns: Array<Record<string, unknown>>}>) => void),
 *   tableExpanded: Set<string>,
 *   activeTable: string | null,
 *   renderSchema: null | (() => void),
 *   activeFileIsJS: boolean,
 *   activeFileIsMD: boolean,
 *   tutorialMode: boolean,
 *   tutorialStep: number,
 *   tutorialActive: boolean,
 *   tutorialLessonType: null | 'theory' | 'practice' | 'hands-on',
 *   challengeMode: boolean,
 *   challengeActive: boolean,
 *   challengeData: null | object,
 *   challengeTaskIndex: number,
 * }}
 */
export const state = {
  db: null,
  sqlite3: null,
  dbName: 'default',
  editorView: null,
  tables: [],
  refreshEditorSchema: null,
  tableExpanded: new Set(),
  activeTable: null,
  renderSchema: null,
  activeFileIsJS: false,
  activeFileIsMD: false,
  tutorialMode: false,
  tutorialStep: 0,
  tutorialActive: false,
  tutorialLessonType: null,
  challengeMode: false,
  challengeActive: false,
  challengeData: null,
  challengeTaskIndex: 0,
};

/**
 * Resets the schema and active-table portions of the shared state.
 */
export function resetState() {
  state.tables = [];
  state.tableExpanded = new Set();
  state.activeTable = null;
  state.dbName = 'default';
}
