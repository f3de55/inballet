import { basicSetup } from 'codemirror';
import { EditorState, type Extension } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';

async function linguaggio(percorso: string): Promise<Extension[]> {
  if (/\.css$/.test(percorso)) return [(await import('@codemirror/lang-css')).css()];
  if (/\.(ts|mts|js|mjs|cjs|gs)$/.test(percorso))
    return [(await import('@codemirror/lang-javascript')).javascript({ typescript: /\.(ts|mts)$/.test(percorso) })];
  if (/\.(astro|html|svg|xml)$/.test(percorso)) return [(await import('@codemirror/lang-html')).html()];
  if (/\.json$/.test(percorso)) return [(await import('@codemirror/lang-json')).json()];
  if (/\.md$/.test(percorso)) return [(await import('@codemirror/lang-markdown')).markdown()];
  return [];
}

export type Editor = { valore(): string; imposta(testo: string): void; vaiRiga(n: number): void; distruggi(): void };

export async function creaEditor(contenitore: HTMLElement, testo: string, percorso: string, cambiato: () => void, salva: () => void): Promise<Editor> {
  const lingua = await linguaggio(percorso);
  const scuro = document.documentElement.dataset.tema === 'scuro' ? [(await import('@codemirror/theme-one-dark')).oneDark] : [];
  const vista = new EditorView({
    parent: contenitore,
    state: EditorState.create({
      doc: testo,
      extensions: [
        keymap.of([
          {
            key: 'Mod-s',
            preventDefault: true,
            run: () => {
              salva();
              return true;
            },
          },
        ]),
        basicSetup,
        EditorView.lineWrapping,
        ...lingua,
        ...scuro,
        EditorView.updateListener.of((u) => {
          if (u.docChanged) cambiato();
        }),
        EditorView.contentAttributes.of({ 'aria-label': `Contenuto di ${percorso}` }),
      ],
    }),
  });
  return {
    valore: () => vista.state.doc.toString(),
    imposta: (t) => vista.dispatch({ changes: { from: 0, to: vista.state.doc.length, insert: t } }),
    vaiRiga: (n) => {
      const riga = vista.state.doc.line(Math.min(Math.max(1, n), vista.state.doc.lines));
      vista.dispatch({ selection: { anchor: riga.from }, effects: EditorView.scrollIntoView(riga.from, { y: 'center' }) });
      vista.focus();
    },
    distruggi: () => vista.destroy(),
  };
}
