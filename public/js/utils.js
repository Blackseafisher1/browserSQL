/**
 * Finds the first matching element inside a parent node.
 * @param {string} selector CSS selector to resolve.
 * @param {ParentNode} [parent=document] Parent node to search within.
 * @returns {Element | null}
 */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * Finds all matching elements inside a parent node and returns them as an array.
 * @param {string} selector CSS selector to resolve.
 * @param {ParentNode} [parent=document] Parent node to search within.
 * @returns {Element[]}
 */
export function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

/**
 * Escapes a string for safe HTML insertion.
 * @param {string} str Raw string value.
 * @returns {string}
 */
export function esc(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Converts a template literal into a DocumentFragment.
 * @param {TemplateStringsArray} strings
 * @param {...unknown} values
 * @returns {DocumentFragment}
 */
export function html(strings, ...values) {
  const str = strings.reduce((acc, s, i) => acc + s + (values[i] !== undefined ? values[i] : ''), '');
  const template = document.createElement('template');
  template.innerHTML = str;
  return template.content;
}

/**
 * Creates a debounced version of a function.
 * @template {(...args: any[]) => void} T
 * @param {T} fn Function to debounce.
 * @param {number} ms Delay in milliseconds.
 * @returns {(...args: Parameters<T>) => void}
 */
export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Escapes a string for use as a SQL identifier (table/column name).
 * @param {string} name
 * @returns {string}
 */
export function escId(name) {
  return `"${name.replace(/"/g, '""')}"`;
}

/**
 * Checks whether the browser currently reports itself as offline.
 * @returns {boolean}
 */
export function isOffline() {
  return !navigator.onLine;
}

/**
 * Fetches a URL. If the browser is offline, throws a clear message.
 * @param {string} url
 * @param {RequestInit} [options]
 * @returns {Promise<Response>}
 */
export async function fetchWithOfflineFallback(url, options) {
  if (isOffline()) throw new Error('You are offline. This feature requires an internet connection.');
  const res = await fetch(url, options);
  if (!res.ok && res.status >= 500) throw new Error(`Server error (${res.status})`);
  return res;
}

/**
 * Returns true if the given path does not contain path-traversal sequences.
 * @param {string} name
 * @returns {boolean}
 */
export function isSafePath(name) {
  return !name.includes('..') && !name.startsWith('/') && !name.startsWith('~') && !name.includes('\\');
}
