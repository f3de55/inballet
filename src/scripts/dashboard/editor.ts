/**
 * Editor descrizione minimale (grassetto, corsivo, elenco puntato) basato su
 * Selection/Range, senza document.execCommand (deprecato).
 * Produce solo i tag ammessi dal server: <b>, <i>, <ul>, <li>.
 */
export type Formato = 'bold' | 'italic' | 'list';

const TAGS: Record<Formato, string[]> = {
  bold: ['B', 'STRONG'],
  italic: ['I', 'EM'],
  list: ['LI'],
};

export function createEditor(editor: HTMLElement, toolbar: HTMLElement, onChange: () => void) {
  /** Antenato (dentro l'editor) con uno dei tag indicati. */
  function closest(node: Node | null, tags: string[]): HTMLElement | null {
    for (let n = node; n && n !== editor; n = n.parentNode) {
      if (n instanceof HTMLElement && tags.includes(n.tagName)) return n;
    }
    return null;
  }

  function currentRange(): Range | null {
    const sel = getSelection();
    if (!sel?.rangeCount) return null;
    const range = sel.getRangeAt(0);
    return editor.contains(range.commonAncestorContainer) ? range : null;
  }

  function selectContents(node: Node) {
    const range = document.createRange();
    range.selectNodeContents(node);
    const sel = getSelection()!;
    sel.removeAllRanges();
    sel.addRange(range);
  }

  /** Sostituisce l'elemento con i suoi figli. */
  function unwrap(el: HTMLElement) {
    const parent = el.parentNode!;
    const first = el.firstChild;
    const last = el.lastChild;
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    el.remove();
    if (first && last) {
      const range = document.createRange();
      range.setStartBefore(first);
      range.setEndAfter(last);
      const sel = getSelection()!;
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  function toggleInline(formato: 'bold' | 'italic', range: Range) {
    const existing = closest(range.commonAncestorContainer, TAGS[formato]);
    if (existing) return unwrap(existing);
    if (range.collapsed) return;
    const el = document.createElement(formato === 'bold' ? 'b' : 'i');
    el.append(range.extractContents());
    range.insertNode(el);
    selectContents(el);
  }

  /** Suddivide un frammento in righe (separate da <br> o blocchi). */
  function lines(fragment: DocumentFragment): Node[][] {
    const out: Node[][] = [[]];
    const walk = (nodes: NodeListOf<ChildNode> | ChildNode[]) => {
      for (const node of [...nodes]) {
        if (node.nodeName === 'BR') out.push([]);
        else if (node instanceof HTMLElement && ['DIV', 'P', 'LI', 'UL', 'OL'].includes(node.tagName)) {
          if (out.at(-1)!.length) out.push([]);
          walk(node.childNodes);
          out.push([]);
        } else out.at(-1)!.push(node);
      }
    };
    walk(fragment.childNodes);
    return out.filter((l) => l.some((n) => n.textContent?.trim()));
  }

  function toggleList(range: Range) {
    const li = closest(range.commonAncestorContainer, TAGS.list);
    if (li?.parentElement) {
      // Rimuovi l'elenco: ogni voce diventa una riga
      const ul = li.parentElement;
      const frag = document.createDocumentFragment();
      [...ul.children].forEach((item, i) => {
        if (i) frag.append(document.createElement('br'));
        frag.append(...item.childNodes);
      });
      ul.replaceWith(frag);
      return;
    }
    // Riga (figlio diretto dell'editor) in cui si trova il cursore
    let riga: Node = range.startContainer;
    while (riga.parentNode && riga.parentNode !== editor) riga = riga.parentNode;

    const ul = document.createElement('ul');
    const righe = range.collapsed ? [] : lines(range.extractContents());
    for (const contenuto of righe.length ? righe : [[document.createElement('br')]]) {
      const item = document.createElement('li');
      item.append(...contenuto);
      ul.append(item);
    }
    // L'elenco è un blocco: mai dentro <b>/<i>; sostituisce una riga vuota
    if (riga === editor) editor.append(ul);
    else if (!riga.textContent?.trim()) (riga as ChildNode).replaceWith(ul);
    else (riga as ChildNode).after(ul);
    if (righe.length) selectContents(ul);
    else getSelection()!.collapse(ul.firstElementChild!, 0);
  }

  function format(formato: Formato) {
    editor.focus();
    const range = currentRange();
    if (!range) return;
    if (formato === 'list') toggleList(range);
    else toggleInline(formato, range);
    editor.normalize();
    updateToolbar();
    onChange();
  }

  function updateToolbar() {
    const range = currentRange();
    for (const btn of toolbar.querySelectorAll<HTMLButtonElement>('[data-format]')) {
      const active = !!range && !!closest(range.commonAncestorContainer, TAGS[btn.dataset.format as Formato]);
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    }
  }

  toolbar.addEventListener('mousedown', (e) => e.preventDefault()); // mantieni la selezione
  toolbar.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>('[data-format]');
    if (btn) format(btn.dataset.format as Formato);
  });

  editor.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    if (e.key === 'b') {
      e.preventDefault();
      format('bold');
    } else if (e.key === 'i') {
      e.preventDefault();
      format('italic');
    }
  });
  editor.addEventListener('input', () => {
    // Un editor svuotato deve tornare vuoto per mostrare il placeholder
    if (!editor.textContent?.trim() && !editor.querySelector('li')) editor.innerHTML = '';
    onChange();
  });
  document.addEventListener('selectionchange', updateToolbar);

  return {
    get html() {
      return editor.innerHTML.trim();
    },
    set html(value: string) {
      editor.innerHTML = value;
    },
    get text() {
      return editor.innerText || '';
    },
  };
}
