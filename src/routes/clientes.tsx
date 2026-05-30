import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Download, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { ClientModal } from "@/components/ClientModal";
import { loadClientes, upsertCliente, deleteCliente } from "@/lib/storage";
import type { Cliente } from "@/lib/types";
import { brl, idade, listaMeses } from "@/lib/format";

export const Route = createFileRoute("/clientes")({
  head: () => ({
    meta: [
      { title: "Base de Clientes — BevCRM" },
      { name: "description", content: "Cadastro completo de clientes da distribuidora." },
    ],
  }),
  component: ClientesPage,
});

type SortKey = "nome" | "bairro" | "valor" | "dataPedido";

function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [fMes, setFMes] = useState("");
  const [fBairro, setFBairro] = useState("");
  const [fPag, setFPag] = useState("");
  const [fTipo, setFTipo] = useState("");
  const [fMod, setFMod] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "dataPedido", dir: "desc" });
  const [modal, setModal] = useState<{ open: boolean; initial?: Partial<Cliente> }>({ open: false });

  useEffect(() => { setClientes(loadClientes()); }, []);

  const bairros = useMemo(() => Array.from(new Set(clientes.map((c) => c.bairro).filter(Boolean))).sort(), [clientes]);

  const filtrados = useMemo(() => {
    const q = busca.toLowerCase().trim();
    let arr = clientes.filter((c) => {
      if (q && !(c.nome.toLowerCase().includes(q) || c.bairro.toLowerCase().includes(q) || c.comprou.toLowerCase().includes(q) || c.alugou.toLowerCase().includes(q))) return false;
      if (fMes && c.mesRef !== fMes) return false;
      if (fBairro && c.bairro !== fBairro) return false;
      if (fPag && c.pagamento !== fPag) return false;
      if (fTipo && c.tipo !== fTipo) return false;
      if (fMod && c.modalidade !== fMod) return false;
      return true;
    });
    arr.sort((a, b) => {
      const av = a[sort.key] as string | number;
      const bv = b[sort.key] as string | number;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [clientes, busca, fMes, fBairro, fPag, fTipo, fMod, sort]);

  function toggleSort(key: SortKey) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }

  function handleSave(c: Cliente) {
    setClientes((prev) => upsertCliente(prev, c));
    toast.success(modal.initial?.id ? "Cliente atualizado" : "Cliente cadastrado");
    setModal({ open: false });
  }
  function handleDelete(id: string) {
    setClientes((prev) => deleteCliente(prev, id));
    toast.success("Cliente excluído");
    setModal({ open: false });
  }

  function exportCSV() {
    const headers = ["Nome","Sexo","Nascimento","Idade","Bairro","Telefone","Tipo","Comprou","Alugou","Valor","Pagamento","Motivo","Modalidade","Endereço","Data do pedido","Mês ref","Status","Observações"];
    const rows = filtrados.map((c) => [c.nome, c.sexo, c.nascimento, idade(c.nascimento), c.bairro, c.telefone, c.tipo, c.comprou, c.alugou, c.valor, c.pagamento, c.motivo, c.modalidade, c.endereco || "", c.dataPedido, c.mesRef, c.status, c.observacoes || ""]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clientes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.addEventListener("click", () => setTimeout(() => URL.revokeObjectURL(url), 10_000), { once: true });
    a.click();
    toast.success("CSV exportado");
  }

  return (
    <Layout>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Base de Clientes</h1>
          <p className="text-sm text-muted-ink">{filtrados.length} de {clientes.length} registros</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 rounded-md border border-divider text-sm font-medium hover:bg-surface">
            <Download className="h-4 w-4" /> Exportar CSV
          </button>
          <button onClick={() => setModal({ open: true })} className="flex items-center gap-2 px-3 py-2 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover">
            <Plus className="h-4 w-4" /> Novo cliente
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="lg:col-span-2 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-ink" />
          <input className="w-full pl-9 pr-3 py-2 rounded-md border border-divider bg-white text-sm" placeholder="Buscar por nome, bairro ou produto" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <select value={fMes} onChange={(e) => setFMes(e.target.value)} className={selCls}>
          <option value="">Todos os meses</option>
          {listaMeses().map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select value={fBairro} onChange={(e) => setFBairro(e.target.value)} className={selCls}>
          <option value="">Todos os bairros</option>
          {bairros.map((b) => <option key={b}>{b}</option>)}
        </select>
        <select value={fTipo} onChange={(e) => setFTipo(e.target.value)} className={selCls}>
          <option value="">Tipo</option>
          <option value="Compra">Compra</option>
          <option value="Locacao">Locação</option>
          <option value="Ambos">Ambos</option>
        </select>
        <select value={fPag} onChange={(e) => setFPag(e.target.value)} className={selCls}>
          <option value="">Pagamento</option>
          {["Dinheiro","PIX","Cartão de débito","Cartão de crédito","Fiado"].map((p) => <option key={p}>{p}</option>)}
        </select>
        <select value={fMod} onChange={(e) => setFMod(e.target.value)} className={selCls}>
          <option value="">Modalidade</option>
          <option value="Entrega">Entrega</option>
          <option value="Retirada">Retirada</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-divider overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-xs text-muted-ink uppercase">
            <tr>
              <Th onClick={() => toggleSort("nome")}>Nome</Th>
              <Th onClick={() => toggleSort("bairro")}>Bairro</Th>
              <th className="px-3 py-3 text-left">Tipo</th>
              <th className="px-3 py-3 text-left">Pagamento</th>
              <th className="px-3 py-3 text-left">Modalidade</th>
              <Th onClick={() => toggleSort("dataPedido")}>Data</Th>
              <Th onClick={() => toggleSort("valor")} align="right">Valor</Th>
              <th className="px-3 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((c) => (
              <tr key={c.id} onClick={() => setModal({ open: true, initial: c })} className="border-t border-divider hover:bg-surface cursor-pointer">
                <td className="px-3 py-3">
                  <div className="font-medium text-foreground">{c.nome}</div>
                  <div className="text-xs text-muted-ink">{c.telefone}</div>
                </td>
                <td className="px-3 py-3 text-muted-ink">{c.bairro}</td>
                <td className="px-3 py-3"><Badge>{c.tipo}</Badge></td>
                <td className="px-3 py-3 text-muted-ink">{c.pagamento}</td>
                <td className="px-3 py-3 text-muted-ink">{c.modalidade}</td>
                <td className="px-3 py-3 text-muted-ink">{new Date(c.dataPedido + "T00:00:00").toLocaleDateString("pt-BR")}</td>
                <td className="px-3 py-3 text-right font-semibold">{brl(c.valor)}</td>
                <td className="px-3 py-3"><Badge tone="dark">{c.status}</Badge></td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-12 text-center text-muted-ink">Nenhum cliente encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ClientModal open={modal.open} initial={modal.initial} onClose={() => setModal({ open: false })} onSave={handleSave} onDelete={handleDelete} />
    </Layout>
  );
}

const selCls = "rounded-md border border-divider bg-white px-3 py-2 text-sm";

function Th({ children, onClick, align }: { children: React.ReactNode; onClick?: () => void; align?: "right" }) {
  return (
    <th className={`px-3 py-3 ${align === "right" ? "text-right" : "text-left"}`}>
      <button onClick={onClick} className="inline-flex items-center gap-1 hover:text-brand">
        {children} <ArrowUpDown className="h-3 w-3" />
      </button>
    </th>
  );
}

function Badge({ children, tone = "mid" }: { children: React.ReactNode; tone?: "light" | "mid" | "dark" }) {
  const map = { light: "bg-[#dce7f5] text-[#1e3d6e]", mid: "bg-brand text-white", dark: "bg-navy text-white" };
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${map[tone]}`}>{children}</span>;
}
