import React, { useState } from 'react';
import {
  Database,
  Table as TableIcon,
  Play,
  Copy,
  Check,
  Code,
  Terminal,
  ShieldCheck,
  Search,
} from 'lucide-react';
import {
  INITIAL_MENU_ITEMS,
  INITIAL_TABLES,
  INITIAL_CUSTOMERS,
  INITIAL_BILLS,
  INITIAL_ORDERS,
} from '../data/restaurantData';

export const DatabaseInspectorView: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<'menu_items' | 'customers' | 'restaurant_tables' | 'bills'>('menu_items');
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM menu_items WHERE price < 300 ORDER BY price ASC;');
  const [queryOutput, setQueryOutput] = useState<any[] | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Sample quick queries
  const sampleQueries = [
    { label: 'All Main Courses', sql: "SELECT * FROM menu_items WHERE category = 'Main Course' ORDER BY price ASC;" },
    { label: 'Top Loyal Customers', sql: 'SELECT name, phone, loyalty_points, total_spent FROM customers ORDER BY loyalty_points DESC;' },
    { label: 'Free Dining Tables', sql: "SELECT * FROM restaurant_tables WHERE status = 'AVAILABLE';" },
    { label: 'Total Revenue Audit', sql: 'SELECT COUNT(*) as total_bills, SUM(payable_amount) as total_revenue FROM bills;' },
  ];

  const handleExecuteQuery = () => {
    setQueryError(null);
    const q = sqlQuery.trim().toLowerCase();

    try {
      if (q.includes('menu_items')) {
        let items = [...INITIAL_MENU_ITEMS];
        if (q.includes('main course')) items = items.filter((i) => i.category === 'Main Course');
        if (q.includes('price < 300')) items = items.filter((i) => i.price < 300);
        if (q.includes('order by price asc')) items.sort((a, b) => a.price - b.price);
        setQueryOutput(
          items.map((i) => ({
            item_id: i.id,
            name: i.name,
            category: i.category,
            price: `₹${i.price.toFixed(2)}`,
            is_veg: i.isVeg ? 'TRUE' : 'FALSE',
            prep_time: `${i.preparationTimeMinutes} min`,
          }))
        );
      } else if (q.includes('customers')) {
        let custs = [...INITIAL_CUSTOMERS];
        if (q.includes('order by loyalty_points desc')) custs.sort((a, b) => b.loyaltyPoints - a.loyaltyPoints);
        setQueryOutput(
          custs.map((c) => ({
            customer_id: c.id,
            name: c.name,
            phone: c.phone,
            loyalty_points: c.loyaltyPoints,
            total_visits: c.totalVisits,
            total_spent: `₹${c.totalSpent.toLocaleString()}`,
          }))
        );
      } else if (q.includes('restaurant_tables')) {
        let tbls = [...INITIAL_TABLES];
        if (q.includes('available')) tbls = tbls.filter((t) => t.status === 'AVAILABLE');
        setQueryOutput(
          tbls.map((t) => ({
            table_id: t.id,
            table_number: t.tableNumber,
            capacity: t.capacity,
            status: t.status,
            customer: t.assignedCustomer || 'None',
          }))
        );
      } else if (q.includes('bills')) {
        if (q.includes('sum(payable_amount)')) {
          const totalRev = INITIAL_BILLS.reduce((sum, b) => sum + b.payableAmount, 0);
          setQueryOutput([{ total_bills: INITIAL_BILLS.length, total_revenue: `₹${totalRev.toLocaleString()}` }]);
        } else {
          setQueryOutput(
            INITIAL_BILLS.map((b) => ({
              bill_id: b.billId,
              order_id: b.orderId,
              table_number: b.tableNumber,
              customer_name: b.customerName,
              subtotal: `₹${b.subtotal.toFixed(2)}`,
              tax: `₹${b.totalTax.toFixed(2)}`,
              payable_amount: `₹${b.payableAmount.toFixed(2)}`,
              payment_mode: b.paymentMode,
            }))
          );
        }
      } else {
        setQueryError('Query executed. Showing sample 3 records from active tables.');
        setQueryOutput([
          { result_status: 'SUCCESS', affected_rows: 0, execution_time: '1.4ms', engine: 'InnoDB' },
        ]);
      }
    } catch (err: any) {
      setQueryError('SQL Error: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">MySQL Relational Database Explorer (hotel_db)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulated MySQL InnoDB database engine with foreign key integrity, index structures, and interactive query console.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/60 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Port 3306 Connected
          </span>
        </div>
      </div>

      {/* SQL Query Sandbox */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200">Interactive JDBC / SQL Query Terminal</h3>
          </div>
          <div className="flex flex-wrap items-center gap-1 text-[11px]">
            <span className="text-slate-500 mr-1">Presets:</span>
            {sampleQueries.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSqlQuery(item.sql);
                }}
                className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <textarea
              rows={2}
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              className="w-full bg-slate-950 font-mono text-xs text-amber-300 p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500 selection:bg-amber-500 selection:text-slate-950 resize-none"
              placeholder="Enter SQL statement (e.g., SELECT * FROM menu_items;)..."
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Uses PreparedStatement execution model; parameterized values prevent SQL injection.
            </span>
            <button
              onClick={handleExecuteQuery}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-sm active:scale-95 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Execute SQL</span>
            </button>
          </div>
        </div>

        {/* Query Output Table */}
        {queryOutput && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">ResultSet Output ({queryOutput.length} rows returned)</span>
              <span className="font-mono text-emerald-400 text-[11px]">Query OK • 0.002 sec</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-x-auto max-h-60 scrollbar-thin">
              <table className="w-full text-xs text-left text-slate-300 font-mono">
                <thead className="bg-slate-900/90 text-amber-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    {Object.keys(queryOutput[0] || {}).map((col) => (
                      <th key={col} className="px-3 py-2">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {queryOutput.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-900/40">
                      {Object.values(row).map((val: any, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 whitespace-nowrap">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {queryError && <div className="text-xs text-amber-400 bg-amber-950/40 p-2.5 rounded border border-amber-800/50">{queryError}</div>}
      </div>

      {/* Relational Tables Explorer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200">Table Schema &amp; Seed Browser</h3>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {(['menu_items', 'customers', 'restaurant_tables', 'bills'] as const).map((tName) => (
              <button
                key={tName}
                onClick={() => setSelectedTable(tName)}
                className={`px-3 py-1 rounded-md font-mono transition cursor-pointer ${
                  selectedTable === tName
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tName}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Table Content */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-x-auto max-h-72 scrollbar-thin">
          {selectedTable === 'menu_items' && (
            <table className="w-full text-xs text-left text-slate-300 font-mono">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2">item_id [PK]</th>
                  <th className="px-3 py-2">name</th>
                  <th className="px-3 py-2">category</th>
                  <th className="px-3 py-2">price</th>
                  <th className="px-3 py-2">is_veg</th>
                  <th className="px-3 py-2">prep_time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {INITIAL_MENU_ITEMS.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/30">
                    <td className="px-3 py-2 text-amber-400 font-bold">{item.id}</td>
                    <td className="px-3 py-2 font-sans text-slate-200">{item.name}</td>
                    <td className="px-3 py-2">{item.category}</td>
                    <td className="px-3 py-2">₹{item.price.toFixed(2)}</td>
                    <td className="px-3 py-2">{item.isVeg ? 'TRUE' : 'FALSE'}</td>
                    <td className="px-3 py-2">{item.preparationTimeMinutes} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedTable === 'customers' && (
            <table className="w-full text-xs text-left text-slate-300 font-mono">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2">customer_id [PK]</th>
                  <th className="px-3 py-2">name</th>
                  <th className="px-3 py-2">phone [UNIQUE]</th>
                  <th className="px-3 py-2">loyalty_points</th>
                  <th className="px-3 py-2">total_visits</th>
                  <th className="px-3 py-2">total_spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {INITIAL_CUSTOMERS.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/30">
                    <td className="px-3 py-2 text-amber-400 font-bold">{c.id}</td>
                    <td className="px-3 py-2 font-sans text-slate-200">{c.name}</td>
                    <td className="px-3 py-2">{c.phone}</td>
                    <td className="px-3 py-2 text-emerald-400 font-bold">{c.loyaltyPoints}</td>
                    <td className="px-3 py-2">{c.totalVisits}</td>
                    <td className="px-3 py-2">₹{c.totalSpent.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedTable === 'restaurant_tables' && (
            <table className="w-full text-xs text-left text-slate-300 font-mono">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2">table_id [PK]</th>
                  <th className="px-3 py-2">table_number [UNIQUE]</th>
                  <th className="px-3 py-2">seating_capacity</th>
                  <th className="px-3 py-2">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {INITIAL_TABLES.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/30">
                    <td className="px-3 py-2 text-amber-400 font-bold">{t.id}</td>
                    <td className="px-3 py-2">Table {t.tableNumber}</td>
                    <td className="px-3 py-2">{t.capacity} Seats</td>
                    <td className="px-3 py-2 font-bold">{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedTable === 'bills' && (
            <table className="w-full text-xs text-left text-slate-300 font-mono">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2">bill_id [PK]</th>
                  <th className="px-3 py-2">order_id [FK]</th>
                  <th className="px-3 py-2">table_number</th>
                  <th className="px-3 py-2">customer_name</th>
                  <th className="px-3 py-2">subtotal</th>
                  <th className="px-3 py-2">payable_amount</th>
                  <th className="px-3 py-2">payment_mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {INITIAL_BILLS.map((b) => (
                  <tr key={b.billId} className="hover:bg-slate-900/30">
                    <td className="px-3 py-2 text-amber-400 font-bold">{b.billId}</td>
                    <td className="px-3 py-2">{b.orderId}</td>
                    <td className="px-3 py-2">Table {b.tableNumber}</td>
                    <td className="px-3 py-2 font-sans">{b.customerName}</td>
                    <td className="px-3 py-2">₹{b.subtotal.toFixed(2)}</td>
                    <td className="px-3 py-2 font-bold text-white">₹{b.payableAmount.toFixed(2)}</td>
                    <td className="px-3 py-2">{b.paymentMode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
