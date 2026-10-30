import { normalizeSearch, searchDocuments, searchTerms, type SearchDocument, type SearchResult } from './search';
import { siteHref } from './nav';
import { samePageAnchor } from './anchor-navigation';

const indexes = new Map<string, Promise<SearchDocument[]>>();

function loadIndex(url: string): Promise<SearchDocument[]> {
  let request = indexes.get(url);
  if (!request) {
    request = fetch(url, { cache: 'no-cache' }).then(async response => {
      if (!response.ok) throw new Error('Search index unavailable');
      const data: unknown = await response.json();
      if (!Array.isArray(data) || data.some(item => !item || typeof item.title !== 'string' || typeof item.text !== 'string' || !Array.isArray(item.tags) || typeof item.path !== 'string' || !/^[a-z0-9/-]+\.html$/.test(item.path))) {
        throw new Error('Invalid search index');
      }
      if (data.some(item => (item.anchor !== undefined && (typeof item.anchor !== 'string' || !/^[a-z0-9-]+$/.test(item.anchor)))
        || (item.targets !== undefined && (!Array.isArray(item.targets) || item.targets.some((target: unknown) => {
          if (!target || typeof target !== 'object') return true;
          const value = target as Record<string, unknown>;
          return typeof value.id !== 'string' || !/^[a-z0-9-]+$/.test(value.id) || typeof value.title !== 'string' || typeof value.text !== 'string';
        }))))) throw new Error('Invalid search destinations');
      return data as SearchDocument[];
    }).catch(error => {
      indexes.delete(url);
      throw error;
    });
    indexes.set(url, request);
  }
  return request;
}

function appendHighlighted(parent: HTMLElement, text: string, query: string) {
  // Use text nodes even for queries containing markup or regular-expression characters.
  const ranges: Array<[number, number]> = [];
  const normalized = normalizeSearch(text);
  for (const term of searchTerms(query)) {
    let position = normalized.indexOf(term);
    while (position >= 0) {
      ranges.push([position, position + term.length]);
      position = normalized.indexOf(term, position + term.length);
    }
  }
  ranges.sort((a, b) => a[0] - b[0]);
  let cursor = 0;
  for (const [start, end] of ranges) {
    if (start < cursor) continue;
    parent.append(document.createTextNode(text.slice(cursor, start)));
    const mark = document.createElement('mark');
    mark.textContent = text.slice(start, end);
    parent.append(mark);
    cursor = end;
  }
  parent.append(document.createTextNode(text.slice(cursor)));
}

function resultLink(result: SearchResult, query: string): HTMLLIElement {
  const { document: item } = result;
  const li = document.createElement('li');
  const link = document.createElement('a');
  link.href = siteHref(item.path) + (result.anchor ? `#${encodeURIComponent(result.anchor)}` : '');
  const meta = document.createElement('span');
  meta.className = 'site-search-result-meta';
  meta.textContent = [item.collectionTitle || (item.kind === 'page' ? 'Page' : 'Collection'), item.date].filter(Boolean).join(' · ');
  const title = document.createElement('span');
  title.className = 'site-search-result-title';
  appendHighlighted(title, item.title, query);
  const excerpt = document.createElement('span');
  excerpt.className = 'site-search-result-excerpt';
  appendHighlighted(excerpt, result.excerpt, query);
  link.append(meta, title, excerpt);
  li.append(link);
  return li;
}

/** Shared enhancement for React pages and pre-rendered collection/article pages. */
export function initializeSearch(root: HTMLElement): () => void {
  const input = root.querySelector<HTMLInputElement>('input[type="search"]')!;
  const form = root.querySelector('form')!;
  const panel = root.querySelector<HTMLElement>('[data-search-results]')!;
  const status = root.querySelector<HTMLElement>('[data-search-status]')!;
  const results = root.querySelector<HTMLOListElement>('[data-search-list]')!;
  const clear = root.querySelector<HTMLButtonElement>('[data-search-clear]')!;
  const retry = root.querySelector<HTMLButtonElement>('[data-search-retry]')!;
  const collection = root.dataset.collection || undefined;
  const originalList = collection ? root.parentElement!.querySelector<HTMLElement>('[data-collection-list]') : null;
  const events = new AbortController();
  let timer: ReturnType<typeof setTimeout>;
  let version = 0;
  let composing = false;
  let active = true;
  let engaged = false;
  root.hidden = false;

  const setPanel = (visible: boolean) => { panel.hidden = !visible; };
  function reset() {
    clearTimeout(timer);
    version++;
    results.replaceChildren();
    retry.hidden = true;
    clear.hidden = !input.value;
    status.textContent = '';
    panel.removeAttribute('aria-busy');
    setPanel(false);
    if (originalList) originalList.hidden = false;
  }

  async function search() {
    const query = input.value.trim();
    if (!query) { reset(); return; }
    const current = ++version;
    retry.hidden = true;
    clear.hidden = false;
    panel.setAttribute('aria-busy', 'true');
    status.textContent = 'Searching…';
    results.replaceChildren();
    if (collection || engaged) setPanel(true);
    if (originalList) originalList.hidden = true;
    try {
      const documents = await loadIndex(root.dataset.indexUrl!);
      if (!active || current !== version) return;
      const matches = searchDocuments(documents, query, collection);
      const scope = collection ? ` in ${root.dataset.collectionTitle}` : '';
      status.textContent = matches.length
        ? `${matches.length} ${matches.length === 1 ? 'result' : 'results'}${scope}`
        : `No results${scope}. Try another word or a shorter phrase.`;
      const fragment = document.createDocumentFragment();
      for (const match of matches) fragment.append(resultLink(match, query));
      results.replaceChildren(fragment);
    } catch {
      if (!active || current !== version) return;
      status.textContent = 'Search could not load. Please try again.';
      retry.hidden = false;
      if (originalList) originalList.hidden = false;
    } finally {
      if (active && current === version) panel.removeAttribute('aria-busy');
    }
  }

  function queueSearch() {
    clearTimeout(timer);
    version++;
    engaged = true;
    clear.hidden = !input.value;
    if (!input.value.trim()) { reset(); return; }
    if (!composing) timer = setTimeout(search, 160);
  }

  function on(target: EventTarget, event: string, handler: EventListener) {
    target.addEventListener(event, handler, { signal: events.signal });
  }
  on(input, 'input', queueSearch);
  on(input, 'search', queueSearch);
  on(input, 'compositionstart', () => { composing = true; clearTimeout(timer); version++; });
  on(input, 'compositionend', () => { composing = false; queueSearch(); });
  on(form, 'submit', event => { event.preventDefault(); if (composing) return; clearTimeout(timer); engaged = true; void search(); });
  on(clear, 'click', () => { input.value = ''; reset(); input.focus(); });
  on(retry, 'click', () => { engaged = true; void search(); });
  on(input, 'focus', () => {
    engaged = true;
    if (input.value.trim()) {
      if (results.children.length || (status.textContent && status.textContent !== 'Searching…')) setPanel(true);
      else void search();
    }
  });
  on(input, 'click', () => { if (input.value.trim() && panel.hidden) { engaged = true; void search(); } });
  on(document, 'pointerdown', event => {
    if (!root.contains(event.target as Node)) { engaged = false; if (!collection) setPanel(false); }
  });
  // WebKit blurs the input before clicking a link, without focusing that link.
  // Close on an actual focus destination outside the widget, not this transient blur.
  on(document, 'focusin', event => {
    if (!root.contains(event.target as Node)) { engaged = false; if (!collection) setPanel(false); }
  });
  on(window, 'hashchange', () => {
    if (!collection) { engaged = false; setPanel(false); }
    else {
      try {
        const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (target && originalList?.contains(target)) { input.value = ''; reset(); }
      } catch { /* Invalid fragments do not affect search. */ }
    }
  });
  on(document, 'click', event => {
    const target = samePageAnchor(event as MouseEvent);
    if (!target) return;
    if (!collection) { engaged = false; setPanel(false); }
    else if (originalList?.contains(target)) { input.value = ''; reset(); }
  });
  on(root, 'keydown', event => {
    const key = event as KeyboardEvent;
    if (key.isComposing || composing) return;
    if (key.key === 'Escape') {
      key.preventDefault(); key.stopPropagation();
      if (collection) { input.value = ''; reset(); }
      clearTimeout(timer);
      version++;
      input.focus();
      engaged = false;
      setPanel(false);
      return;
    }
    if (!['ArrowDown', 'ArrowUp'].includes(key.key) || panel.hidden) return;
    const links = [...results.querySelectorAll<HTMLAnchorElement>('a')];
    if (!links.length) return;
    key.preventDefault();
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (key.key === 'ArrowDown') (links[index + 1] || input).focus();
    else if (index === -1) links[links.length - 1].focus();
    else (links[index - 1] || input).focus();
  });
  return () => { active = false; version++; clearTimeout(timer); events.abort(); };
}
