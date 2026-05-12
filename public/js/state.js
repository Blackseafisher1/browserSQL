export const state = {
  db: null,
  sqlite3: null,
  dbName: 'untitled',
  editorView: null,
  tables: [],
  refreshEditorSchema: null,
  tableExpanded: new Set(),
  activeTable: null,
  renderSchema: null,
};

export function resetState() {
  state.tables = [];
  state.tableExpanded = new Set();
  state.activeTable = null;
  state.dbName = 'untitled';
}
