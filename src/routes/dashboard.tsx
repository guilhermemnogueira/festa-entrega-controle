import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Layout } from "@/components/Layout";
import { loadClientes } from "@/lib/storage";
import type { Cliente } from "@/lib/types";
import { brl, idade, listaMeses, mesDeNascimento, mesNumero, mesRefAtual } from "@/lib/format";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — BevCRM" },
      { name: "description", content: "Indicadores e gráficos da operação." },
    ],
  }),
  component: DashboardPage,
});

const AZUL = {
  dark: "#0b1f3a",
  mid: "#1e3d6e",
  light: "#6b9fd4",
  pale: "#a8c2e3",
  paler: "#c5d5e8",
};

function DashboardPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mes, setMes] = useState(mesRefAtual());
  useEffect(() => { setClientes(loadClientes()); }, []);

  const doMes = useMemo(() => clientes.filter((c) => c.mesRef === mes), [clientes, mes]);
  const mesNum = mesNumero(mes);

  const totalClientes = clientes.length;
  const faturamento = doMes.reduce((s, c) => s + c.valor, 0);
  const ticket = doMes.length ? faturamento / doMes.length : 0;
  const entregas = doMes.filter((c) => c.modalidade === "Entrega").length;
  const retiradas = doMes.filter((c) => c.modalidade === "Retirada").length;
  const recorrentes = doMes.filter((c) => c.status === "Recorrente").length;
  const aniver = clientes.filter((c) => mesDeNascimento(c.nascimento) === mesNum).length;

  const faturamentoMes = useMemo(() => {
    const meses = listaMeses().slice().reverse();
    return meses.map((m) => ({
      mes: m.label.slice(0, 3),
      valor: clientes.filter((c) => c.mesRef === m.value).reduce((s, c) => s + c.valor, 0),
    }));
  }, [clientes]);

  const bairrosData = useMemo(() => {
    const map = new Map<string, number>();
    doMes.forEach((c) => map.set(c.bairro || "—", (map.get(c.bairro || "—") || 0) + 1));
    return Array.from(map.entries()).map(([nome, qtd]) => ({ nome, qtd })).sort((a, b) => b.qtd - a.qtd).slice(0, 8);
  }, [doMes]);

  const pagamentosData = useMemo(() => {
    const map = new Map<string, number>();
    doMes.forEach((c) => map.set(c.pagamento, (map.get(c.pagamento) || 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [doMes]);

  const motivosData = useMemo(() => {
    const map = new Map<string, number>();
    doMes.forEach((c) => { if (c.motivo) map.set(c.motivo, (map.get(c.motivo) || 0) + 1); });
    return Array.from(map.entries()).map(([nome, qtd]) => ({ nome, qtd })).sort((a, b) => b.qtd - a.qtd).slice(0, 6);
  }, [doMes]);

  const faixasData = useMemo(() => {
    const faixas = [
      { nome: "18-25", min: 18, max: 25 },
      { nome: "26-35", min: 26, max: 35 },
      { nome: "36-45", min: 36, max: 45 },
      { nome: "46-60", min: 46, max: 60 },
      { nome: "60+", min: 61, max: 200 },
    ];
    return faixas.map((f) => ({ nome: f.nome, qtd: doMes.filter((c) => { const a = idade(c.nascimento); return a >= f.min && a <= f.max; }).length }));
  }, [doMes]);

  const sexoData = useMemo(() => {
    const map = new Map<string, number>();
    doMes.forEach((c) => map.set(c.sexo, (map.get(c.sexo) || 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [doMes]);

  const cxlData = useMemo(() => {
    const meses = listaMeses().slice().reverse();
    return meses.map((m) => {
      const arr = clientes.filter((c) => c.mesRef === m.value);
      return {
        mes: m.label.slice(0, 3),
        compras: arr.filter((c) => c.tipo === "Compra" || c.tipo === "Ambos").length,
        locacoes: arr.filter((c) => c.tipo === "Locacao" || c.tipo === "Ambos").length,
      };
    });
  }, [clientes]);

  const ranking = useMemo(() => {
    const map = new Map<string, number>();
    doMes.forEach((c) => {
      [c.comprou, c.alugou].forEach((txt) => {
        if (!txt) return;
        txt.split(/,|;/).forEach((p) => { const k = p.trim(); if (k) map.set(k, (map.get(k) || 0) + 1); });
      });
    });
    return Array.from(map.entries()).map(([nome, qtd]) => ({ nome, qtd })).sort((a, b) => b.qtd - a.qtd).slice(0, 8);
  }, [doMes]);

  return (
    <Layout>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-ink">Indicadores e tendências da operação</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-muted-ink">Período</label>
          <select value={mes} onChange={(e) => setMes(e.target.value)} className="rounded-md border border-divider bg-white px-3 py-2 text-sm">
            {listaMeses().map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <Kpi label="Total de clientes" value={totalClientes.toString()} />
        <Kpi label="Faturamento do mês" value={brl(faturamento)} />
        <Kpi label="Ticket médio" value={brl(ticket)} />
        <Kpi label="Entregas / Retiradas" value={`${entregas} / ${retiradas}`} />
        <Kpi label="Recorrentes" value={recorrentes.toString()} />
        <Kpi label="Aniversariantes" value={aniver.toString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Faturamento por mês">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={faturamentoMes}>
              <CartesianGrid strokeDasharray="3 3" stroke={AZUL.paler} />
              <XAxis dataKey="mes" stroke={AZUL.mid} fontSize={12} />
              <YAxis stroke={AZUL.mid} fontSize={12} />
              <Tooltip formatter={(v: number) => brl(v)} />
              <Bar dataKey="valor" fill={AZUL.mid} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top bairros">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={bairrosData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={AZUL.paler} />
              <XAxis type="number" stroke={AZUL.mid} fontSize={12} />
              <YAxis dataKey="nome" type="category" stroke={AZUL.mid} fontSize={12} width={100} />
              <Tooltip />
              <Bar dataKey="qtd" fill={AZUL.light} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Formas de pagamento">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pagamentosData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                {pagamentosData.map((_, i) => <Cell key={i} fill={[AZUL.dark, AZUL.mid, AZUL.light, AZUL.pale, AZUL.paler][i % 5]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Motivos mais frequentes">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={motivosData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={AZUL.paler} />
              <XAxis type="number" stroke={AZUL.mid} fontSize={12} />
              <YAxis dataKey="nome" type="category" stroke={AZUL.mid} fontSize={11} width={130} />
              <Tooltip />
              <Bar dataKey="qtd" fill={AZUL.mid} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Distribuição por faixa etária">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={faixasData}>
              <CartesianGrid strokeDasharray="3 3" stroke={AZUL.paler} />
              <XAxis dataKey="nome" stroke={AZUL.mid} fontSize={12} />
              <YAxis stroke={AZUL.mid} fontSize={12} />
              <Tooltip />
              <Bar dataKey="qtd" fill={AZUL.dark} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Distribuição por sexo">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={sexoData} dataKey="value" nameKey="name" outerRadius={90} label>
                {sexoData.map((_, i) => <Cell key={i} fill={[AZUL.mid, AZUL.light, AZUL.dark][i % 3]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Compras vs Locações por mês">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={cxlData}>
              <CartesianGrid strokeDasharray="3 3" stroke={AZUL.paler} />
              <XAxis dataKey="mes" stroke={AZUL.mid} fontSize={12} />
              <YAxis stroke={AZUL.mid} fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="compras" fill={AZUL.dark} radius={[4, 4, 0, 0]} />
              <Bar dataKey="locacoes" fill={AZUL.light} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Ranking de produtos">
          {ranking.length === 0 ? (
            <p className="text-sm text-muted-ink py-8 text-center">Sem dados no período</p>
          ) : (
            <ul className="space-y-2">
              {ranking.map((r, i) => (
                <li key={r.nome} className="flex items-center gap-3 p-2 rounded hover:bg-surface">
                  <span className="h-7 w-7 rounded-md bg-brand text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="flex-1 text-sm text-foreground truncate">{r.nome}</span>
                  <span className="text-xs font-semibold text-muted-ink">{r.qtd}x</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </Layout>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-navy/20 rounded-lg p-4">
      <div className="text-xs text-muted-ink mb-1">{label}</div>
      <div className="text-xl font-bold text-foreground">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-divider rounded-lg p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      {children}
    </div>
  );
}
