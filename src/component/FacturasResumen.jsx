import MetricCard from "./MetricCard";
import { DollarSign, CheckCircle, Clock, FileText } from "lucide-react";

export default function FacturasResumen({ cantidadPagadas, cantidadPendiente, total }) {
  return (
    <section className="mt-6">
      <h3 className="text-lg font-semibold text-[#01060c] dark:text-white mb-4">
        Resumen de Facturación
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Facturas Pagadas"
          value={cantidadPagadas}
          subtitle="Este mes"
          icon={CheckCircle}
        />
        <MetricCard
          title="Facturas Pendientes"
          value={cantidadPendiente}
          subtitle="$125.00"
          icon={Clock}
        />
        <MetricCard
          title="Total Facturas"
          value={total}
          subtitle="Últimos 30 días"
          icon={FileText}
        />
      </div>
    </section>
  );
}
