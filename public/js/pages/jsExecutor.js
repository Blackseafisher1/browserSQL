import { state } from '../state.js';
import { showInput } from './shellView.js';

export async function executeJS(code) {
  const logs = [];
  let inputResolve = null;
  let inputPromise = null;

  function fakeConsole(...args) {
    const line = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
    logs.push({ type: 'log', text: line });
  }

  fakeConsole.log = fakeConsole;
  fakeConsole.warn = (...args) => logs.push({ type: 'warn', text: args.join(' ') });
  fakeConsole.error = (...args) => logs.push({ type: 'error', text: args.join(' ') });
  fakeConsole.table = (data) => logs.push({ type: 'log', text: typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data) });

  async function input(promptText) {
    if (!code.includes('await input')) {
      logs.push({ type: 'warn', text: 'Tip: use await input() to wait for user input (e.g. const name = await input("?"))' });
    }
    return new Promise((resolve) => {
      showInput(promptText || '', resolve);
    });
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
