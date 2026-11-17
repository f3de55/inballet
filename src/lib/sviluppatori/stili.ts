import postcss, { type AtRule, type ChildNode, type Container, type Rule } from 'postcss';

export type Dichiarazione = { prop: string; valore: string; importante: boolean };
export type RegolaCss = {
  file: string;
  percorso: number[];
  selettore: string;
  contesti: string[];
  dichiarazioni: Dichiarazione[];
  fotogrammi?: string;
};
export type ModificaCss = { prop: string; valore: string | null };

export class ErroreCss extends Error {}

const spazi = (s: string) => s.replace(/\s+/g, ' ').trim();

export function regole(file: string, testo: string): RegolaCss[] {
  const out: RegolaCss[] = [];
  const visita = (nodi: ChildNode[], percorso: number[], contesti: string[], fotogrammi?: string) =>
    nodi.forEach((n, i) => {
      const p = [...percorso, i];
      if (n.type === 'rule') {
        out.push({
          file,
          percorso: p,
          selettore: spazi(n.selector),
          contesti,
          dichiarazioni: n.nodes.flatMap((d) => (d.type === 'decl' ? [{ prop: d.prop, valore: d.value, importante: Boolean(d.important) }] : [])),
          ...(fotogrammi && { fotogrammi }),
        });
      } else if (n.type === 'atrule' && n.nodes) {
        if (/keyframes$/i.test(n.name)) visita(n.nodes, p, contesti, n.params);
        else visita(n.nodes, p, [...contesti, `@${n.name} ${spazi(n.params)}`], fotogrammi);
      }
    });
  visita(postcss.parse(testo).nodes, [], []);
  return out;
}

function fuoriDaVirgolette(valore: string): string {
  return valore.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, '""');
}

function valida({ prop, valore }: ModificaCss): void {
  if (!/^(--[\w-]+|-?[a-z][a-z-]*)$/i.test(prop)) throw new ErroreCss(`Proprietà non valida: ${prop}`);
  if (valore === null) return;
  const nudo = fuoriDaVirgolette(valore);
  if (!valore.trim() || /[{};]/.test(nudo)) throw new ErroreCss(`Valore non valido per ${prop}: ${valore}`);
  let profondita = 0;
  for (const c of nudo) {
    if (c === '(') profondita++;
    if (c === ')' && --profondita < 0) break;
  }
  if (profondita !== 0) throw new ErroreCss(`Parentesi non bilanciate in ${prop}: ${valore}`);
}

function regolaIn(root: Container, percorso: number[], selettore: string): Rule {
  let nodo: ChildNode | undefined;
  let contenitore: Container | undefined = root;
  for (const i of percorso) {
    nodo = contenitore?.nodes?.[i];
    contenitore = nodo && 'nodes' in nodo ? (nodo as Container) : undefined;
  }
  if (!nodo || nodo.type !== 'rule' || spazi(nodo.selector) !== spazi(selettore)) {
    throw new ErroreCss('Il file è cambiato nel frattempo: ricarica gli stili e riprova.');
  }
  return nodo;
}

export function applica(testo: string, percorso: number[], selettore: string, modifiche: ModificaCss[]): string {
  modifiche.forEach(valida);
  const root = postcss.parse(testo);
  const regola = regolaIn(root, percorso, selettore);
  for (const { prop, valore } of modifiche) {
    const esistenti = regola.nodes.filter((d) => d.type === 'decl' && d.prop === prop);
    if (valore === null) {
      esistenti.forEach((d) => d.remove());
      continue;
    }
    const importante = /!\s*important\s*$/i.test(valore);
    const pulito = valore.replace(/!\s*important\s*$/i, '').trim();
    const ultima = esistenti.at(-1);
    if (ultima && ultima.type === 'decl') {
      ultima.value = pulito;
      ultima.important = importante;
    } else regola.append({ prop, value: pulito, important: importante });
  }
  return root.toString();
}

export function aggiungiRegola(testo: string, selettore: string, contesti: string[], dichiarazioni: ModificaCss[]): string {
  if (!selettore.trim() || /[{};]/.test(fuoriDaVirgolette(selettore))) throw new ErroreCss(`Selettore non valido: ${selettore}`);
  dichiarazioni.forEach(valida);
  try {
    postcss.parse(`${selettore}{}`);
  } catch {
    throw new ErroreCss(`Selettore non valido: ${selettore}`);
  }
  const root = postcss.parse(testo);
  let contenitore: Container = root;
  for (const c of contesti) {
    const m = /^@([\w-]+)\s+(.+)$/.exec(c.trim());
    if (!m) throw new ErroreCss(`Contesto non valido: ${c}`);
    const esistente = [...(contenitore.nodes ?? [])]
      .reverse()
      .find((n): n is AtRule => n.type === 'atrule' && n.name === m[1] && spazi(n.params) === spazi(m[2]));
    if (esistente) contenitore = esistente;
    else {
      const nuova = postcss.atRule({ name: m[1], params: m[2] });
      contenitore.append(nuova);
      contenitore = nuova;
    }
  }
  const regola = postcss.rule({ selector: selettore.trim() });
  for (const d of dichiarazioni) if (d.valore !== null) regola.append({ prop: d.prop, value: d.valore });
  contenitore.append(regola);
  return root.toString();
}

export function verificaCss(testo: string): void {
  try {
    postcss.parse(testo);
  } catch (e) {
    throw new ErroreCss(`CSS non valido: ${(e as Error).message}`);
  }
}
