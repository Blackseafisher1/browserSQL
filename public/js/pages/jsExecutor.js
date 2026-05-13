import { state } from '../state.js';

export async function executeJS(code) {
  const logs = [];

  function fakeConsole(...args) {
    const line = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
    logs.push({ type: 'log', text: line });
  }

  fakeConsole.log = fakeConsole;
  fakeConsole.warn = (...args) => logs.push({ type: 'warn', text: args.join(' ') });
  fakeConsole.error = (...args) => logs.push({ type: 'error', text: args.join(' ') });
  fakeConsole.table = (data) => logs.push({ type: 'log', text: typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data) });

  try {
    const fn = new Function('db', 'console', code);
    const result = fn(state.db, fakeConsole);
    if (result instanceof Promise) await result;
    return { logs, error: null };
  } catch (err) {
    logs.push({ type: 'error', text: err.message || String(err) });
    return { logs, error: err.message || String(err) };
  }
}
