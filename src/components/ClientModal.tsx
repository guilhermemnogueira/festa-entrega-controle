import { useEffect, useState, type ReactNode } from "react";
import { X, Trash2 } from "lucide-react";
import type { Cliente, StatusKanban } from "@/lib/types";
import { STATUS_LIST } from "@/lib/types";
import { newId } from "@/lib/storage";
import { idade, mesRefAtual } from "@/lib/format";

interface Props {
  open: boolean;
  initial?: Partial<Cliente>;
  onClose: () => void;
  onSave: (c: Cliente) => void;
  onDelete?: (id: string) => void;
}

const empty: Cliente = {
  id: "",
  nome: "",
  sexo: "Masculino",
  nascimento: "",
  bairro: "",
  telefone: "",
  tipo: "Compra",
  comprou: "",
  alugou: "",
  valor: 0,
  pagamento: "PIX",
  motivo: "",
  modalidade: "Retirada",
  endereco: "",
  dataPedido: new Date().toISOString().slice(0, 10),
  mesRef: mesRefAtual(),
  observacoes: "",
  status: "Novo Contato",
};

export function ClientModal({ open, initial, onClose, onSave, onDelete }: Props) {
  const [c, setC] = useState<Cliente>(empty);
  const [askDelete, setAskDelete] = useState(false);

  useEffect(() => {
    if (open) {
      const today = new Date().toISOString().slice(0, 10);
      setC({ ...empty, dataPedido: today, mesRef: mesRefAtual(), ...initial, id: initial?.id || newId() } as Cliente);
      setAskDelete(false);
    }
  }, [open, initial]);

  if (!open) return null;

  function set<K extends keyof Cliente>(k: K, v: Cliente[K]) {
    setC((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "dataPedido" && typeof v === "string" && v) {
        next.mesRef = (v as string).slice(0, 7);
      }
      return next;
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave(c);
  }

  const showEndereco = c.modalidade === "Entrega";

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1f3a]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <form
        onSubmit={submit}
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-divider px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {initial?.id ? "Editar cliente" : "Novo cliente"}
            </h2>
            <p className="text-xs text-muted-ink">Preencha os dados do cliente e do pedido</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded hover:bg-surface">
            <X className="h-5 w-5 text-muted-ink" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nome completo" required>
            <input className={inp} value={c.nome} onChange={(e) => set("nome", e.target.value)} required />
          </Field>
          <Field label="Sexo">
            <select className={inp} value={c.sexo} onChange={(e) => set("sexo", e.target.value as any)}>
              <option>Masculino</option><option>Feminino</option><option>Outro</option>
            </select>
          </Field>
          <Field label={`Data de nascimento${c.nascimento ? ` (${idade(c.nascimento)} anos)` : ""}`}>
            <input type="date" className={inp} value={c.nascimento} onChange={(e) => set("nascimento", e.target.value)} />
          </Field>
          <Field label="Bairro">
            <input className={inp} value={c.bairro} onChange={(e) => set("bairro", e.target.value)} />
          </Field>
          <Field label="Telefone / WhatsApp">
            <input className={inp} value={c.telefone} onChange={(e) => set("telefone", e.target.value)} />
          </Field>
          <Field label="Tipo de transação">
            <select className={inp} value={c.tipo} onChange={(e) => set("tipo", e.target.value as any)}>
              <option value="Compra">Compra de bebida</option>
              <option value="Locacao">Locação de material</option>
              <option value="Ambos">Ambos</option>
            </select>
          </Field>
          <Field label="O que comprou">
            <input className={inp} value={c.comprou} onChange={(e) => set("comprou", e.target.value)} placeholder="ex: 2 caixas de cerveja Heineken" />
          </Field>
          <Field label="O que alugou">
            <input className={inp} value={c.alugou} onChange={(e) => set("alugou", e.target.value)} placeholder="ex: 10 cadeiras, 2 mesas" />
          </Field>
          <Field label="Valor gasto (R$)">
            <input type="number" step="0.01" className={inp} value={c.valor} onChange={(e) => set("valor", parseFloat(e.target.value) || 0)} />
          </Field>
          <Field label="Forma de pagamento">
            <select className={inp} value={c.pagamento} onChange={(e) => set("pagamento", e.target.value as any)}>
              <option>Dinheiro</option><option>PIX</option><option>Cartão de débito</option><option>Cartão de crédito</option><option>Fiado</option>
            </select>
          </Field>
          <Field label="Motivo">
            <input className={inp} value={c.motivo} onChange={(e) => set("motivo", e.target.value)} placeholder="ex: Casamento, Festa junina" />
          </Field>
          <Field label="Modalidade">
            <select className={inp} value={c.modalidade} onChange={(e) => set("modalidade", e.target.value as any)}>
              <option value="Entrega">Entrega no endereço</option>
              <option value="Retirada">Retirada no local</option>
            </select>
          </Field>
          {showEndereco && (
            <Field label="Endereço de entrega" full>
              <input className={inp} value={c.endereco || ""} onChange={(e) => set("endereco", e.target.value)} />
            </Field>
          )}
          <Field label="Data do pedido">
            <input type="date" className={inp} value={c.dataPedido} onChange={(e) => set("dataPedido", e.target.value)} />
          </Field>
          <Field label="Status no Kanban">
            <select className={inp} value={c.status} onChange={(e) => set("status", e.target.value as StatusKanban)}>
              {STATUS_LIST.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Observações" full>
            <textarea className={inp + " min-h-[80px]"} value={c.observacoes || ""} onChange={(e) => set("observacoes", e.target.value)} />
          </Field>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-divider px-6 py-4 flex items-center justify-between gap-3">
          <div>
            {initial?.id && onDelete && (
              askDelete ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-ink">Confirmar exclusão?</span>
                  <button type="button" onClick={() => onDelete(c.id)} className="px-3 py-1.5 rounded bg-destructive text-white text-xs font-medium">Sim, excluir</button>
                  <button type="button" onClick={() => setAskDelete(false)} className="px-3 py-1.5 rounded bg-surface text-xs">Cancelar</button>
                </div>
              ) : (
                <button type="button" onClick={() => setAskDelete(true)} className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded">
                  <Trash2 className="h-4 w-4" /> Excluir
                </button>
              )
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border border-divider text-sm font-medium hover:bg-surface">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover">
              Salvar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

const inp = "w-full rounded-md border border-divider bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand";

function Field({ label, children, required, full }: { label: string; children: ReactNode; required?: boolean; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-xs font-medium text-muted-ink mb-1.5">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}
