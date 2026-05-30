export type Sexo = "Masculino" | "Feminino" | "Outro";
export type TipoTransacao = "Compra" | "Locacao" | "Ambos";
export type FormaPagamento = "Dinheiro" | "PIX" | "Cartão de débito" | "Cartão de crédito" | "Fiado";
export type Modalidade = "Entrega" | "Retirada";
export type StatusKanban =
  | "Novo Contato"
  | "Pedido Realizado"
  | "Em Entrega / Retirada"
  | "Concluído"
  | "Recorrente";

export interface Cliente {
  id: string;
  nome: string;
  sexo: Sexo;
  nascimento: string; // YYYY-MM-DD
  bairro: string;
  telefone: string;
  tipo: TipoTransacao;
  comprou: string;
  alugou: string;
  valor: number;
  pagamento: FormaPagamento;
  motivo: string;
  modalidade: Modalidade;
  endereco?: string;
  dataPedido: string; // YYYY-MM-DD
  mesRef: string; // YYYY-MM
  observacoes?: string;
  status: StatusKanban;
}

export const STATUS_LIST: StatusKanban[] = [
  "Novo Contato",
  "Pedido Realizado",
  "Em Entrega / Retirada",
  "Concluído",
  "Recorrente",
];
