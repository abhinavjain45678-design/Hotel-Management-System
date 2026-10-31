import React, { useState } from 'react';
import {
  Utensils,
  Plus,
  Minus,
  Trash2,
  Receipt,
  Users,
  LayoutGrid,
  Check,
  Search,
  DollarSign,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Download,
} from 'lucide-react';
import {
  INITIAL_MENU_ITEMS,
  INITIAL_TABLES,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_BILLS,
  type MenuItemData,
  type RestaurantTableData,
  type CustomerData,
  type OrderRecord,
  type BillRecord,
  type OrderItemEntry,
} from '../data/restaurantData';
import {
  calculateBilling,
  validateCustomer,
  formatAsciiReceipt,
  type OrderItemCalculation,
} from '../utils/billingRules';

export const SimulatorView: React.FC = () => {
  // State stores
  const [menuItems, setMenuItems] = useState<MenuItemData[]>(INITIAL_MENU_ITEMS);
  const [tables, setTables] = useState<RestaurantTableData[]>(INITIAL_TABLES);
  const [customers, setCustomers] = useState<CustomerData[]>(INITIAL_CUSTOMERS);
  const [orders, setOrders] = useState<OrderRecord[]>(INITIAL_ORDERS);
  const [bills, setBills] = useState<BillRecord[]>(INITIAL_BILLS);

  // Sub-tabs
  const [posTab, setPosTab] = useState<'pos' | 'tables' | 'bills' | 'customers' | 'menu' | 'analytics'>('pos');

  // Active Order State in POS
  const [selectedTable, setSelectedTable] = useState<number>(1);
  const [activeCart, setActiveCart] = useState<OrderItemEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');

  // Customer in POS
  const [customerName, setCustomerName] = useState<string>('Vikram Malhotra');
  const [customerPhone, setCustomerPhone] = useState<string>('9820112233');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Credit Card'>('UPI');

  // Dialog / Viewer States
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Customer search helper
  const handleCustomerPhoneChange = (phone: string) => {
    setCustomerPhone(phone);
    const existing = customers.find((c) => c.phone === phone.trim());
    if (existing) {
      setCustomerName(existing.name);
    }
  };

  // Add Item to active cart
  const handleAddToCart = (item: MenuItemData) => {
    setActiveCart((prev) => {
      const idx = prev.findIndex((entry) => entry.item.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 };
        return copy;
      }
      return [...prev, { item, quantity: 1 }];
    });
    showToast(`Added ${item.name} to order ticket`);
  };

  const handleUpdateQuantity = (itemId: number, delta: number) => {
    setActiveCart((prev) => {
      return prev
        .map((entry) => {
          if (entry.item.id === itemId) {
            const nextQty = entry.quantity + delta;
            return nextQty > 0 ? { ...entry, quantity: nextQty } : null;
          }
          return entry;
        })
        .filter(Boolean) as OrderItemEntry[];
    });
  };

  const handleRemoveFromCart = (itemId: number) => {
    setActiveCart((prev) => prev.filter((e) => e.item.id !== itemId));
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Calculations for active cart
  const cartCalculations: OrderItemCalculation[] = activeCart.map((entry) => ({
    id: entry.item.id,
    name: entry.item.name,
    price: entry.item.price,
    quantity: entry.quantity,
    category: entry.item.category,
  }));

  const billingSummary = calculateBilling(cartCalculations, discountPercent);

  // Settle & Generate Bill
  const handleSettleAndGenerateBill = () => {
    if (activeCart.length === 0) {
      alert('Cannot generate bill for an empty order ticket! Please add items first.');
      return;
    }

    const validation = validateCustomer(customerName, customerPhone);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    const billId = `BILL-${Date.now().toString().slice(-8)}`;
    const newOrderId = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Create bill record
    const newBill: BillRecord = {
      billId,
      orderId: newOrderId,
      tableNumber: selectedTable,
      customerName,
      customerPhone,
      items: [...activeCart],
      subtotal: billingSummary.subtotal,
      discountPercent,
      discountAmount: billingSummary.discountAmount,
      cgst: billingSummary.cgstAmount,
      sgst: billingSummary.sgstAmount,
      totalTax: billingSummary.totalTax,
      payableAmount: billingSummary.payableAmount,
      paymentMode,
      paidAt: dateStr,
      cashier: 'Admin (Desktop POS)',
    };

    // 2. Update bills list
    setBills((prev) => [newBill, ...prev]);

    // 3. Update customer CRM or create new
    setCustomers((prev) => {
      const existing = prev.find((c) => c.phone === customerPhone);
      if (existing) {
        return prev.map((c) =>
          c.phone === customerPhone
            ? {
                ...c,
                totalVisits: c.totalVisits + 1,
                totalSpent: c.totalSpent + billingSummary.payableAmount,
                loyaltyPoints: c.loyaltyPoints + Math.floor(billingSummary.payableAmount / 50),
              }
            : c
        );
      } else {
        const newCust: CustomerData = {
          id: prev.length + 1,
          name: customerName,
          phone: customerPhone,
          email: `${customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          loyaltyPoints: Math.floor(billingSummary.payableAmount / 50),
          totalVisits: 1,
          totalSpent: billingSummary.payableAmount,
          joinedDate: new Date().toISOString().split('T')[0],
        };
        return [...prev, newCust];
      }
    });

    // 4. Update table status to AVAILABLE
    setTables((prev) =>
      prev.map((t) =>
        t.tableNumber === selectedTable
          ? { ...t, status: 'AVAILABLE', currentOrderId: undefined, assignedCustomer: undefined }
          : t
      )
    );

    // 5. Generate and show ASCII thermal receipt
    const asciiReceipt = formatAsciiReceipt(
      billId,
      newOrderId,
      selectedTable,
      customerName,
      customerPhone,
      cartCalculations,
      billingSummary,
      paymentMode,
      `${new Date().toISOString().split('T')[0]} ${dateStr}`
    );

    setViewingReceipt(asciiReceipt);
    setActiveCart([]);
    showToast(`Bill ${billId} generated and serialized to invoices/${billId}.txt!`);
  };

  // Filtered menu
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesDiet =
      dietFilter === 'all' || (dietFilter === 'veg' && item.isVeg) || (dietFilter === 'non-veg' && !item.isVeg);
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDiet && matchesSearch;
  });

  const categories = ['All', 'Starters', 'Main Course', 'Breads', 'Beverages', 'Desserts', 'Combos'];

  // Total daily revenue
  const totalRevenue = bills.reduce((acc, b) => acc + b.payableAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* System Status Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span>Java Virtual Machine: OpenJDK 17.0</span>
              <span className="text-slate-500">|</span>
              <span className="text-emerald-400 font-mono text-xs">MySQL JDBC: Connected (hotel_db:3306)</span>
            </div>
            <p className="text-xs text-slate-400">
              Desktop POS Simulator with real-time OOP business model, JDBC DAO transactions, and File I/O receipts.
            </p>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setPosTab('pos')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition cursor-pointer ${
              posTab === 'pos' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" /> Order POS
          </button>
          <button
            onClick={() => setPosTab('tables')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition cursor-pointer ${
              posTab === 'tables' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Tables ({tables.filter((t) => t.status === 'AVAILABLE').length} Free)
          </button>
          <button
            onClick={() => setPosTab('bills')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition cursor-pointer ${
              posTab === 'bills' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" /> Bills &amp; File I/O ({bills.length})
          </button>
          <button
            onClick={() => setPosTab('customers')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition cursor-pointer ${
              posTab === 'customers' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Customers ({customers.length})
          </button>
          <button
            onClick={() => setPosTab('analytics')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition cursor-pointer ${
              posTab === 'analytics' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Sales Audit
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="bg-emerald-950/90 border border-emerald-600/50 text-emerald-200 px-4 py-2.5 rounded-lg text-sm flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* POS TAB */}
      {posTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Menu Catalog (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search and Filter Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dishes by name (e.g. Paneer, Biryani, Naan)..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                {/* Veg / Non-Veg Toggle */}
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
                  <button
                    onClick={() => setDietFilter('all')}
                    className={`px-2.5 py-1 rounded-md transition ${dietFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setDietFilter('veg')}
                    className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition ${
                      dietFilter === 'veg' ? 'bg-emerald-900/60 text-emerald-300 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Veg
                  </button>
                  <button
                    onClick={() => setDietFilter('non-veg')}
                    className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition ${
                      dietFilter === 'non-veg' ? 'bg-rose-900/60 text-rose-300 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Non-Veg
                  </button>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[620px] overflow-y-auto pr-1">
              {filteredMenuItems.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 flex flex-col justify-between transition hover:shadow-md"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Food symbol */}
                        <div
                          className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center p-0.5 ${
                            dish.isVeg ? 'border-emerald-500' : 'border-rose-500'
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${dish.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          ></div>
                        </div>
                        <h4 className="font-semibold text-slate-100 text-sm leading-snug">{dish.name}</h4>
                      </div>
                      {dish.specialBadge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                          {dish.specialBadge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{dish.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" /> {dish.preparationTimeMinutes}m
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300 font-mono">{dish.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800/80">
                    <span className="text-base font-bold text-amber-400 font-mono">₹{dish.price.toFixed(2)}</span>
                    <button
                      onClick={() => handleAddToCart(dish)}
                      aria-label={`Add ${dish.name} to order`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer active:scale-95 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Active Order Sheet & Billing (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-xl">
              {/* Order Meta Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-slate-100 text-sm">Active Order &amp; Billing Desk</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Table:</label>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 font-semibold focus:outline-none focus:border-amber-500"
                  >
                    {tables.map((t) => (
                      <option key={t.id} value={t.tableNumber}>
                        Table {t.tableNumber} ({t.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer Record Section (Encapsulation / CRM) */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-amber-400" /> Customer Information
                  </span>
                  {customers.find((c) => c.phone === customerPhone) && (
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
                      Loyalty: {customers.find((c) => c.phone === customerPhone)?.loyaltyPoints} Pts
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => handleCustomerPhoneChange(e.target.value)}
                      placeholder="e.g. 9820112233"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Customer name"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Order Items Cart */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
                  <span>Ordered Items ({activeCart.length})</span>
                  <span>Qty × Price = Total</span>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {activeCart.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg">
                      No dishes in current ticket.
                      <p className="text-[11px] text-slate-600 mt-1">Select items from the menu on the left.</p>
                    </div>
                  ) : (
                    activeCart.map((entry) => (
                      <div
                        key={entry.item.id}
                        className="bg-slate-950/90 border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5 max-w-[170px]">
                          <div className="font-medium text-slate-200 truncate">{entry.item.name}</div>
                          <div className="text-[10px] text-slate-500">₹{entry.item.price} each</div>
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-md p-1">
                          <button
                            onClick={() => handleUpdateQuantity(entry.item.id, -1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center font-bold text-amber-400">{entry.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(entry.item.id, 1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right flex items-center gap-2">
                          <span className="font-mono font-semibold text-slate-200">
                            ₹{(entry.item.price * entry.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleRemoveFromCart(entry.item.id)}
                            className="text-slate-600 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Discounts & Payment Modes */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Discount / Offer</label>
                  <select
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value={0}>No Discount (0%)</option>
                    <option value={5}>Family Special (5%)</option>
                    <option value={10}>Promo WELCOME10 (10%)</option>
                    <option value={15}>VIP Dining (15%)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Cash">Cash at Counter</option>
                    <option value="Credit Card">Credit / Debit Card</option>
                  </select>
                </div>
              </div>

              {/* Financial Calculation Summary (GST 5%) */}
              <div className="bg-slate-950 rounded-lg p-3 space-y-1.5 text-xs font-mono border border-slate-800">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>₹{billingSummary.subtotal.toFixed(2)}</span>
                </div>
                {billingSummary.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({billingSummary.discountPercent}%):</span>
                    <span>-₹{billingSummary.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Taxable Amount:</span>
                  <span>₹{billingSummary.taxableAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>CGST (2.5%):</span>
                  <span>₹{billingSummary.cgstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>SGST (2.5%):</span>
                  <span>₹{billingSummary.sgstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400 border-t border-slate-800/80 pt-1">
                  <span>Round Off:</span>
                  <span>
                    {billingSummary.roundOff >= 0 ? '+' : ''}
                    {billingSummary.roundOff.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-amber-400 border-t border-slate-800 pt-1.5">
                  <span className="font-sans">Net Payable Amount:</span>
                  <span>₹{billingSummary.payableAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Settle Bill Action */}
              <button
                onClick={handleSettleAndGenerateBill}
                disabled={activeCart.length === 0}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm transition shadow-lg shadow-amber-950/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <FileText className="w-4 h-4" />
                <span>Settle Order &amp; Print Bill (File I/O)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLES VIEW */}
      {posTab === 'tables' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Restaurant Floor Layout</h3>
              <p className="text-xs text-slate-400">Visual table occupancy synchronized with MySQL table records.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {tables.map((tbl) => {
              const statusColors: Record<string, string> = {
                AVAILABLE: 'border-emerald-600/40 bg-emerald-950/20 text-emerald-400',
                OCCUPIED: 'border-rose-600/40 bg-rose-950/20 text-rose-400',
                RESERVED: 'border-amber-600/40 bg-amber-950/20 text-amber-400',
                BILLING: 'border-blue-600/40 bg-blue-950/20 text-blue-400',
              };

              return (
                <div
                  key={tbl.id}
                  className={`border rounded-xl p-4 flex flex-col justify-between transition hover:shadow-lg ${
                    statusColors[tbl.status] || 'border-slate-800 bg-slate-900'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-white">Table {tbl.tableNumber}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-900/80 border border-slate-700">
                        {tbl.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300">
                      <span>Capacity: {tbl.capacity} Guests</span>
                    </div>
                    {tbl.assignedCustomer && (
                      <div className="text-xs bg-slate-900/60 p-2 rounded border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Guest:</span>
                        <span className="font-semibold text-slate-200">{tbl.assignedCustomer}</span>
                        {tbl.seatedSince && (
                          <span className="text-[10px] text-slate-500 block">Since: {tbl.seatedSince}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedTable(tbl.tableNumber);
                        setPosTab('pos');
                        showToast(`Selected Table ${tbl.tableNumber} in POS`);
                      }}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Take Order</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    {tbl.status === 'OCCUPIED' && (
                      <button
                        onClick={() => {
                          setTables((prev) =>
                            prev.map((t) =>
                              t.id === tbl.id
                                ? { ...t, status: 'AVAILABLE', assignedCustomer: undefined, currentOrderId: undefined }
                                : t
                            )
                          );
                          showToast(`Table ${tbl.tableNumber} vacated.`);
                        }}
                        className="text-[11px] text-slate-400 hover:text-rose-400"
                      >
                        Vacate Table
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BILLS & FILE I/O ARCHIVE */}
      {posTab === 'bills' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Settled Bills &amp; File I/O Invoices</h3>
              <p className="text-xs text-slate-400">
                Invoices serialized as ASCII text files on disk by Java <code>FileHandlerUtil.java</code>.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3">Table</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Subtotal</th>
                    <th className="px-4 py-3">GST (5%)</th>
                    <th className="px-4 py-3 font-bold text-slate-200">Net Payable</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3 text-right">File I/O Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {bills.map((bill) => (
                    <tr key={bill.billId} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 font-bold text-amber-400">{bill.billId}</td>
                      <td className="px-4 py-3">Table {bill.tableNumber}</td>
                      <td className="px-4 py-3 font-sans">
                        <span className="font-semibold text-slate-200">{bill.customerName}</span>
                        <span className="text-[10px] text-slate-500 block">{bill.customerPhone}</span>
                      </td>
                      <td className="px-4 py-3">₹{bill.subtotal.toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-400">₹{bill.totalTax.toFixed(2)}</td>
                      <td className="px-4 py-3 font-bold text-white">₹{bill.payableAmount.toFixed(2)}</td>
                      <td className="px-4 py-3 font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                          {bill.paymentMode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{bill.paidAt}</td>
                      <td className="px-4 py-3 text-right font-sans">
                        <button
                          onClick={() => {
                            const calculated: OrderItemCalculation[] = bill.items.map((entry) => ({
                              id: entry.item.id,
                              name: entry.item.name,
                              price: entry.item.price,
                              quantity: entry.quantity,
                              category: entry.item.category,
                            }));
                            const summary = calculateBilling(calculated, bill.discountPercent);
                            const receiptText = formatAsciiReceipt(
                              bill.billId,
                              bill.orderId,
                              bill.tableNumber,
                              bill.customerName,
                              bill.customerPhone,
                              calculated,
                              summary,
                              bill.paymentMode,
                              bill.paidAt
                            );
                            setViewingReceipt(receiptText);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-medium cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" /> View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER CRM VIEW */}
      {posTab === 'customers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Customer Record Management (CRM)</h3>
              <p className="text-xs text-slate-400">
                Encapsulated customer profiles with phone index lookups and automatic loyalty point calculation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {customers.map((c) => (
              <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{c.name}</h4>
                      <p className="text-xs text-slate-500 font-mono">{c.phone}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    {c.loyaltyPoints} Pts
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Dining Visits</span>
                    <span className="font-bold text-slate-200">{c.totalVisits} visits</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Lifetime Spent</span>
                    <span className="font-bold text-amber-400 font-mono">₹{c.totalSpent.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Customer #{c.id}</span>
                  <span>Joined: {c.joinedDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SALES ANALYTICS VIEW */}
      {posTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 font-medium">Today's Revenue</span>
              <div className="text-2xl font-bold text-amber-400 font-mono mt-1">₹{totalRevenue.toLocaleString()}</div>
              <span className="text-[11px] text-emerald-400 mt-1 block">Live aggregated from bills table</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 font-medium">Total Bills Settled</span>
              <div className="text-2xl font-bold text-white font-mono mt-1">{bills.length}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Serialized to /invoices/*.txt</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 font-medium">Average Order Value</span>
              <div className="text-2xl font-bold text-white font-mono mt-1">
                ₹{bills.length ? Math.round(totalRevenue / bills.length) : 0}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Per table dining session</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-slate-200 text-sm">Java File I/O Audit Log (logs/hotel_audit.log)</h4>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
              <div>[2026-10-31 11:42:15] BILL_GENERATED | ID: BILL-20261031-001 | Table: 1 | Amount: 444.00</div>
              <div>[2026-10-31 11:58:33] BILL_GENERATED | ID: BILL-20261031-002 | Table: 4 | Amount: 1111.00</div>
              {bills.slice(2).map((b) => (
                <div key={b.billId} className="text-emerald-400">
                  [{new Date().toISOString().split('T')[0]} {b.paidAt}] BILL_GENERATED | ID: {b.billId} | Table:{' '}
                  {b.tableNumber} | Amount: {b.payableAmount.toFixed(2)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ASCII Receipt Modal Viewer */}
      {viewingReceipt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">ASCII Thermal Bill (Java FileHandler Output)</h3>
              </div>
              <button
                onClick={() => setViewingReceipt(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto border border-slate-800 max-h-96 select-all">
              {viewingReceipt}
            </pre>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">Stored at: invoices/BILL_*.txt</span>
              <button
                onClick={() => {
                  const blob = new Blob([viewingReceipt], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `invoice-${Date.now()}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download .txt Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
