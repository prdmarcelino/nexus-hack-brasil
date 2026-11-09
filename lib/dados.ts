/** Compara estruturas JSON independentemente da ordem das chaves dos objetos. */
export function assinaturaDados(valor: unknown): string {
 function ordenar(item: unknown): unknown {
  if (Array.isArray(item)) return item.map(ordenar);
  if (item && typeof item === "object") return Object.fromEntries(Object.entries(item).sort(([a],[b]) => a.localeCompare(b)).map(([chave,valor]) => [chave,ordenar(valor)]));
  return item;
 }
 return JSON.stringify(ordenar(valor));
}
