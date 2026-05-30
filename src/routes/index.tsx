import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, ShoppingCart, Package, Cake, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { ClientModal } from "@/components/ClientModal";
import { loadClientes, upsertCliente, deleteCliente, updateStatus } from "@/lib/storage";
import { STATUS_LIST, type Cliente, type StatusKanban } from "@/lib/types";
import { brl, listaMeses, mesNumero, mesRefAtual, mesDeNascimento } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kanban Mensal — BevCRM" },
      { name: "description", content: "Acompanhe o fluxo mensal de atendimento de clientes." },
    ],
  }),
  component: KanbanPage,
});

function KanbanPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mes, setMes] = useState(mesRefAtual());
  const [modal, setModal] = useState<{ open: boolean; initial?: Partial<Cliente> }>({ open: false });
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<StatusKanban | null>(null);

  useEffect(() => { setClientes(loadClientes()); }, []);

  const filtered = useMemo(() => clientes.filter((c) => c.mesRef === mes), [clientes, mes]);
  const mesAtualNum = mesNumero(mes);

  const byCol = useMemo(() => {
    const map: Record<StatusKanban, Cliente[]> = {
      "Novo Contato": [], "Pedido Realizado": [], "Em Entrega / Retirada": [], "Concluído": [], "Recorrente": [],
    };
    filtered.forEach((c) => map[c.status].push(c));
    return map;
  }, [filtered]);

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

  function onDropTo(col: StatusKanban) {
    if (!dragId) return;
    setClientes((prev) => updateStatus(prev, dragId, col));
    toast.success(`Movido para "${col}"`);
    setDragId(null);
    setOverCol(null);
  }

  return (
    <Layout>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kanban Mensal</h1>
          <p className="text-sm text-muted-ink">Arraste os cards entre as colunas para atualizar o status</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-muted-ink">Período</label>
          <select value={mes} onChange={(e) => setMes(e.target.value)} className="rounded-md border border-divider bg-white px-3 py-2 text-sm">
            {listaMeses().map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {STATUS_LIST.map((col) => (
          <div
            key={col}
            onDragOver={(e) => { e.preventDefault(); setOverCol(col); }}
            onDragLeave={() => setOverCol((c) => (c === col ? null : c))}
            onDrop={() => onDropTo(col)}
            className={`bg-white rounded-lg border-l-4 border-l-brand border-y border-r border-divider p-3 min-h-[300px] transition-colors ${
              overCol === col ? "bg-surface" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{col}</h3>
                <p className="text-xs text-muted-ink">{byCol[col].length} cliente(s)</p>
              </div>
              <button
                onClick={() => setModal({ open: true, initial: { status: col, mesRef: mes } })}
                className="h-7 w-7 rounded-md bg-brand text-white flex items-center justify-center hover:bg-brand-hover"
                title="Adicionar"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {byCol[col].map((c) => {
                const aniversariante = mesDeNascimento(c.nascimento) === mesAtualNum;
                return (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={() => setDragId(c.id)}
                    onClick={() => setModal({ open: true, initial: c })}
                    className={`bg-surface rounded-md p-3 cursor-pointer hover:bg-[#dce7f5] transition-all border ${
                      aniversariante ? "border-brand border-2 shadow-sm" : "border-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-medium text-sm text-foreground line-clamp-1">{c.nome}</div>
                      {aniversariante && <Cake className="h-4 w-4 text-brand shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-ink mb-2">
                      <MapPin className="h-3 w-3" /> {c.bairro || "—"}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{brl(c.valor)}</span>
                      <div className="flex items-center gap-1">
                        {(c.tipo === "Compra" || c.tipo === "Ambos") && (
                          <span title="Compra" className="h-6 w-6 rounded bg-badge-mid text-white flex items-center justify-center">
                            <ShoppingCart className="h-3 w-3" />
                          </span>
                        )}
                        {(c.tipo === "Locacao" || c.tipo === "Ambos") && (
                          <span title="Locação" className="h-6 w-6 rounded bg-badge-light text-white flex items-center justify-center">
                            <Package className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {byCol[col].length === 0 && (
                <div className="text-xs text-muted-ink text-center py-6 border border-dashed border-divider rounded-md">
                  Solte cards aqui
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <ClientModal
        open={modal.open}
        initial={modal.initial}
        onClose={() => setModal({ open: false })}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </Layout>
  );
}
