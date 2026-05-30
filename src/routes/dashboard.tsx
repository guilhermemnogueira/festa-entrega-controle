import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { loadClientes } from "@/lib/storage";
import type { Cliente } from "@/lib/types";
import { listaMeses, mesRefAtual } from "@/lib/format";

const DashboardCharts = lazy(() => import("@/components/DashboardCharts"));

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — BevCRM" },
      { name: "description", content: "Indicadores e gráficos da operação." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mes, setMes] = useState(mesRefAtual());
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setClientes(loadClientes()); setMounted(true); }, []);

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

      {mounted ? (
        <Suspense fallback={<DashboardSkeletons />}>
          <DashboardCharts clientes={clientes} mes={mes} />
        </Suspense>
      ) : (
        <DashboardSkeletons />
      )}
    </Layout>
  );
}

/* ── Skeleton layout ─────────────────────────────────────────────────── */

function DashboardSkeletons() {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {Array.from({ length: 6 }).map((_, i) => <KpiSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChartSkeleton title="Faturamento por mês" count={12} />
        <HBarChartSkeleton title="Top bairros" count={6} />
        <PieSkeleton title="Formas de pagamento" slices={4} />
        <HBarChartSkeleton title="Motivos mais frequentes" count={5} />
        <BarChartSkeleton title="Distribuição por faixa etária" count={5} />
        <PieSkeleton title="Distribuição por sexo" slices={3} />
        <BarChartSkeleton title="Compras vs Locações por mês" count={12} grouped />
        <RankingSkeleton />
      </div>
    </>
  );
}

/* ── Skeleton components ─────────────────────────────────────────────── */

function KpiSkeleton() {
  return (
    <div className="bg-white border border-navy/20 rounded-lg p-4 animate-pulse">
      <div className="h-3 w-24 bg-surface rounded mb-3" />
      <div className="h-6 w-20 bg-[#dce7f5] rounded" />
    </div>
  );
}

const BAR_HEIGHTS = [55, 88, 48, 108, 72, 128, 82, 100, 60, 92, 68, 112];

function BarChartSkeleton({ title, count, grouped = false }: { title: string; count: number; grouped?: boolean }) {
  const bars = BAR_HEIGHTS.slice(0, count);
  return (
    <div className="bg-white border border-divider rounded-lg p-4 animate-pulse">
      <div className="h-4 w-36 bg-surface rounded mb-1" />
      <div className="relative mt-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="absolute left-0 right-0 border-t border-[#eef2f7]" style={{ bottom: `${28 + i * 48}px` }} />
        ))}
        <div className="flex items-end gap-1 h-[222px] pb-7">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 flex items-end gap-px">
              <div className="flex-1 bg-[#1e3d6e]/20 rounded-t transition-none" style={{ height: h }} />
              {grouped && <div className="flex-1 bg-[#6b9fd4]/35 rounded-t" style={{ height: Math.round(h * 0.55) }} />}
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {bars.map((_, i) => (
            <div key={i} className="flex-1 h-2.5 bg-surface rounded" />
          ))}
        </div>
        {grouped && (
          <div className="flex items-center gap-4 mt-3 justify-center">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#1e3d6e]/20" /><div className="w-14 h-2.5 bg-surface rounded" /></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#6b9fd4]/35" /><div className="w-14 h-2.5 bg-surface rounded" /></div>
          </div>
        )}
      </div>
    </div>
  );
}

const HBAR_WIDTHS = [88, 62, 76, 48, 92, 55, 40, 70];

function HBarChartSkeleton({ title, count }: { title: string; count: number }) {
  const rows = HBAR_WIDTHS.slice(0, count);
  const rowH = Math.floor(260 / count);
  return (
    <div className="bg-white border border-divider rounded-lg p-4 animate-pulse">
      <div className="h-4 w-28 bg-surface rounded mb-3" />
      <div className="flex flex-col justify-between" style={{ height: 260 }}>
        {rows.map((w, i) => (
          <div key={i} className="flex items-center gap-3" style={{ height: rowH - 6 }}>
            <div className="shrink-0 h-3 bg-surface rounded" style={{ width: i % 2 === 0 ? 80 : 100 }} />
            <div className="h-5 bg-[#1e3d6e]/20 rounded-r" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

const LEGEND_WIDTHS = [72, 56, 84, 48, 66];

function PieSkeleton({ title, slices }: { title: string; slices: number }) {
  const legend = LEGEND_WIDTHS.slice(0, slices);
  return (
    <div className="bg-white border border-divider rounded-lg p-4 animate-pulse">
      <div className="h-4 w-32 bg-surface rounded mb-2" />
      <div className="flex flex-col items-center justify-center gap-5" style={{ height: 260 }}>
        <div className="relative w-44 h-44 shrink-0">
          <div className="w-full h-full rounded-full bg-[#1e3d6e]/18" />
          <div className="absolute rounded-full bg-white" style={{ inset: 42 }} />
          <div
            className="absolute rounded-full border-[18px] border-transparent"
            style={{
              inset: 14,
              borderTopColor: "#dce7f5",
              borderRightColor: "#a8c2e3",
              transform: "rotate(-30deg)",
            }}
          />
        </div>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {legend.map((w, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#dce7f5]" />
              <div className="h-2.5 bg-surface rounded" style={{ width: w }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const RANK_WIDTHS = [86, 70, 92, 58, 78, 52, 82, 66];

function RankingSkeleton() {
  return (
    <div className="bg-white border border-divider rounded-lg p-4 animate-pulse">
      <div className="h-4 w-32 bg-surface rounded mb-4" />
      <div className="space-y-1">
        {RANK_WIDTHS.map((w, i) => (
          <div key={i} className="flex items-center gap-3 px-2 py-1.5 rounded">
            <div className="h-7 w-7 rounded-md bg-[#1e3d6e]/20 shrink-0" />
            <div className="flex-1 h-3 bg-surface rounded" style={{ maxWidth: `${w}%` }} />
            <div className="w-7 h-3 bg-[#dce7f5] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
