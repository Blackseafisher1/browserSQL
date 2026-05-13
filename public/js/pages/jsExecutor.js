import { state } from '../state.js';

// Expose db globally for browser console usage
Object.defineProperty(window, 'db', {
  get: () => {
    const d = state.db;
    return d ? d : null;
  },
  configurable: true,
});

window.input = async (msg) => prompt(msg || '');

// Helper: run SQL and get values array directly
window.sql = (query) => {
  const d = state.db;
  if (!d) return [];
  const rows = d.exec(query, { rowMode: 'object' });
  return rows;
};

export async function executeJS(code) {
  const logs = [];
  let inputResolve = null;
  let inputPromise = null;

  function fakeConsole(...args) {
    const line = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
    logs.push({ type: 'log', text: line });
    window.console.log(...args);
  }

  fakeConsole.log = fakeConsole;
  fakeConsole.warn = (...args) => { logs.push({ type: 'warn', text: args.join(' ') }); window.console.warn(...args); };
  fakeConsole.error = (...args) => { logs.push({ type: 'error', text: args.join(' ') }); window.console.error(...args); };
  fakeConsole.table = (data) => { logs.push({ type: 'log', text: typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data) }); window.console.table(data); };

  async function input(promptText) {
    logs.push({ type: 'warn', text: 'input() not supported in this shell. Open F12 console and run your code there for interactive input.' });
    return '';
  }

  try {
    const fn = new Function('db', 'console', 'input', `return (async () => { ${code} })()`);
    const result = fn(state.db, fakeConsole, input);
    if (result instanceof Promise) {
      await result;
    }
    return { logs, error: null };
  } catch (err) {
    logs.push({ type: 'error', text: err.message || String(err) });
    return { logs, error: err.message || String(err) };
  }
}
