import React, { useEffect, useState } from 'react';
import api from '../api';
import { Users, Package, FileText, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="animate-pulse flex space-x-4 p-8 text-center text-gray-500">Cargando métricas...</div>;

  const cards = [
    { title: 'Ingresos Totales', value: `$${stats.totalRevenue.toLocaleString('es-CL', { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
    { title: 'Facturas Emitidas', value: stats.invoicesCount, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { title: 'Clientes Activos', value: stats.clientsCount, icon: Users, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { title: 'Productos', value: stats.productsCount, icon: Package, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{card.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Resumen de Ventas</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlySales || []}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-gray-700/50" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10}} 
                  tickFormatter={(value) => `$${value.toLocaleString('es-CL', { maximumFractionDigits: 0 })}`} 
                />
                <Tooltip 
                  cursor={{ stroke: 'var(--color-primary-500)', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                  }}
                  itemStyle={{ color: 'var(--color-primary-600)', fontWeight: 'bold' }}
                  formatter={(value) => [`$${value.toLocaleString('es-CL')}`, 'Ventas']}
                  labelStyle={{ color: '#64748b', fontSize: 11 }}
                />
                <Area type="monotone" dataKey="total" stroke="var(--color-primary-500)" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Facturas Recientes</h3>
          <div className="space-y-4">
            {stats.latestInvoices?.length === 0 && <p className="text-gray-500 text-sm">No hay facturas aún.</p>}
            {stats.latestInvoices?.map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{inv.number}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{inv.client?.name || 'Cliente Desconocido'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">${inv.total.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</p>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                    inv.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
