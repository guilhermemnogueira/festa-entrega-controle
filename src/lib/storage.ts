import type { Cliente, StatusKanban } from "./types";
import { STATUS_LIST } from "./types";
import { mesRefAtual } from "./format";

const KEY = "bevcrm.clientes.v1";

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const SEED: Omit<Cliente, "id">[] = [
  { nome: "Ana Souza", sexo: "Feminino", nascimento: "1992-05-14", bairro: "Centro", telefone: "(11) 98888-1010", tipo: "Compra", comprou: "2 caixas de cerveja Heineken", alugou: "", valor: 320, pagamento: "PIX", motivo: "Churrasco de aniversário", modalidade: "Entrega", endereco: "Rua A, 100", dataPedido: monthDay(0, 3), mesRef: mesRefAtual(), observacoes: "Cliente VIP", status: "Concluído" },
  { nome: "Bruno Lima", sexo: "Masculino", nascimento: "1988-11-02", bairro: "Vila Mariana", telefone: "(11) 97777-2020", tipo: "Locacao", comprou: "", alugou: "10 cadeiras, 2 mesas", valor: 180, pagamento: "Dinheiro", motivo: "Festa junina", modalidade: "Retirada", dataPedido: monthDay(0, 8), mesRef: mesRefAtual(), status: "Pedido Realizado" },
  { nome: "Carla Mendes", sexo: "Feminino", nascimento: "1995-07-20", bairro: "Moema", telefone: "(11) 96666-3030", tipo: "Ambos", comprou: "1 caixa de vinho", alugou: "1 cooler grande", valor: 540, pagamento: "Cartão de crédito", motivo: "Casamento", modalidade: "Entrega", endereco: "Av. B, 250", dataPedido: monthDay(0, 12), mesRef: mesRefAtual(), status: "Em Entrega / Retirada" },
  { nome: "Diego Ferreira", sexo: "Masculino", nascimento: "1990-03-09", bairro: "Pinheiros", telefone: "(11) 95555-4040", tipo: "Compra", comprou: "3 caixas de cerveja, 4 refrigerantes", alugou: "", valor: 410, pagamento: "PIX", motivo: "Confraternização", modalidade: "Retirada", dataPedido: monthDay(0, 15), mesRef: mesRefAtual(), status: "Novo Contato" },
  { nome: "Eduarda Rocha", sexo: "Feminino", nascimento: "1985-09-25", bairro: "Centro", telefone: "(11) 94444-5050", tipo: "Locacao", comprou: "", alugou: "20 cadeiras, 5 mesas, 1 tenda", valor: 720, pagamento: "Fiado", motivo: "Aniversário infantil", modalidade: "Entrega", endereco: "Rua C, 88", dataPedido: monthDay(0, 18), mesRef: mesRefAtual(), status: "Recorrente" },
  { nome: "Felipe Santos", sexo: "Masculino", nascimento: "1993-12-30", bairro: "Tatuapé", telefone: "(11) 93333-6060", tipo: "Compra", comprou: "1 caixa de whisky", alugou: "", valor: 980, pagamento: "Cartão de débito", motivo: "Festa de ano novo", modalidade: "Entrega", endereco: "Av. D, 1500", dataPedido: monthDay(-1, 5), mesRef: monthRef(-1), status: "Concluído" },
  { nome: "Gabriela Pinto", sexo: "Feminino", nascimento: "1998-01-18", bairro: "Vila Mariana", telefone: "(11) 92222-7070", tipo: "Ambos", comprou: "2 caixas de cerveja", alugou: "1 churrasqueira", valor: 290, pagamento: "PIX", motivo: "Churrasco entre amigos", modalidade: "Retirada", dataPedido: monthDay(-1, 14), mesRef: monthRef(-1), status: "Concluído" },
  { nome: "Henrique Alves", sexo: "Masculino", nascimento: "1980-06-11", bairro: "Moema", telefone: "(11) 91111-8080", tipo: "Locacao", comprou: "", alugou: "30 cadeiras, 8 mesas", valor: 850, pagamento: "Dinheiro", motivo: "Casamento", modalidade: "Entrega", endereco: "Rua E, 45", dataPedido: monthDay(-1, 22), mesRef: monthRef(-1), status: "Concluído" },
  { nome: "Isabela Castro", sexo: "Feminino", nascimento: "1991-10-05", bairro: "Pinheiros", telefone: "(11) 90000-9090", tipo: "Compra", comprou: "5 caixas de cerveja, 2 vodkas", alugou: "", valor: 1240, pagamento: "Cartão de crédito", motivo: "Festa corporativa", modalidade: "Entrega", endereco: "Av. F, 999", dataPedido: monthDay(-2, 7), mesRef: monthRef(-2), status: "Concluído" },
  { nome: "João Pedro", sexo: "Masculino", nascimento: "1996-04-22", bairro: "Tatuapé", telefone: "(11) 98989-1234", tipo: "Compra", comprou: "1 caixa de vinho, 3 espumantes", alugou: "", valor: 460, pagamento: "PIX", motivo: "Jantar romântico", modalidade: "Retirada", dataPedido: monthDay(-2, 16), mesRef: monthRef(-2), status: "Concluído" },
  { nome: "Karina Dias", sexo: "Feminino", nascimento: "1987-08-08", bairro: "Centro", telefone: "(11) 97878-4321", tipo: "Ambos", comprou: "2 caixas de cerveja", alugou: "15 cadeiras, 3 mesas", valor: 520, pagamento: "Fiado", motivo: "Festa junina", modalidade: "Entrega", endereco: "Rua G, 12", dataPedido: monthDay(-2, 25), mesRef: monthRef(-2), status: "Concluído" },
  { nome: "Lucas Martins", sexo: "Masculino", nascimento: "1994-02-28", bairro: "Vila Mariana", telefone: "(11) 96767-5432", tipo: "Locacao", comprou: "", alugou: "2 coolers, 1 caixa de som", valor: 230, pagamento: "Dinheiro", motivo: "Churrasco de aniversário", modalidade: "Retirada", dataPedido: monthDay(0, 20), mesRef: mesRefAtual(), status: "Pedido Realizado" },
];

function monthRef(offset: number): string {
  const now = new Date();
  const dt = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
}
function monthDay(offset: number, day: number): string {
  const now = new Date();
  const dt = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const daysInMonth = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate();
  const safeDay = Math.min(day, daysInMonth);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`;
}

const VALID_STATUS = new Set<string>(STATUS_LIST);

function sanitize(c: any): Cliente {
  return { ...c, status: VALID_STATUS.has(c.status) ? c.status : "Novo Contato" };
}

export function loadClientes(): Cliente[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const seeded = SEED.map((c) => ({ ...c, id: uid() }));
      localStorage.setItem(KEY, JSON.stringify(seeded));
      return seeded;
    }
    return (JSON.parse(raw) as any[]).map(sanitize);
  } catch {
    return [];
  }
}

export function saveClientes(list: Cliente[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function upsertCliente(list: Cliente[], c: Cliente): Cliente[] {
  const exists = list.some((x) => x.id === c.id);
  const next = exists ? list.map((x) => (x.id === c.id ? c : x)) : [...list, c];
  saveClientes(next);
  return next;
}

export function deleteCliente(list: Cliente[], id: string): Cliente[] {
  const next = list.filter((x) => x.id !== id);
  saveClientes(next);
  return next;
}

export function updateStatus(list: Cliente[], id: string, status: StatusKanban): Cliente[] {
  const next = list.map((c) => (c.id === id ? { ...c, status } : c));
  saveClientes(next);
  return next;
}

export function newId() {
  return uid();
}
