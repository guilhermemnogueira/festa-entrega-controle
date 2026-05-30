export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function idade(nascimento: string): number {
  if (!nascimento) return 0;
  const n = new Date(nascimento);
  const hoje = new Date();
  let a = hoje.getFullYear() - n.getFullYear();
  const m = hoje.getMonth() - n.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < n.getDate())) a--;
  return a;
}

export function mesDeNascimento(nascimento: string): number {
  if (!nascimento) return -1;
  return new Date(nascimento + "T00:00:00").getMonth();
}

export function mesRefAtual(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function listaMeses(): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 0; i < 12; i++) {
    const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const value = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    const label = dt.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    out.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  return out;
}

export function mesNumero(mesRef: string): number {
  // YYYY-MM -> 0..11
  if (!mesRef) return -1;
  return parseInt(mesRef.split("-")[1], 10) - 1;
}
