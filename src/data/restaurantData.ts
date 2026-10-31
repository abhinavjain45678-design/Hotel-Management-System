export interface MenuItemData {
  id: number;
  name: string;
  category: 'Starters' | 'Main Course' | 'Breads' | 'Beverages' | 'Desserts' | 'Combos';
  price: number;
  isVeg: boolean;
  description: string;
  preparationTimeMinutes: number;
  isAvailable: boolean;
  specialBadge?: string;
}

export interface RestaurantTableData {
  id: number;
  tableNumber: number;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'BILLING';
  currentOrderId?: number;
  assignedCustomer?: string;
  seatedSince?: string;
}

export interface CustomerData {
  id: number;
  name: string;
  phone: string;
  email: string;
  loyaltyPoints: number;
  totalVisits: number;
  totalSpent: number;
  joinedDate: string;
}

export interface OrderItemEntry {
  item: MenuItemData;
  quantity: number;
  notes?: string;
}

export interface OrderRecord {
  id: number;
  tableNumber: number;
  customerName: string;
  customerPhone: string;
  status: 'PENDING' | 'IN_KITCHEN' | 'SERVED' | 'BILLED';
  items: OrderItemEntry[];
  subtotal: number;
  createdAt: string;
}

export interface BillRecord {
  billId: string;
  orderId: number;
  tableNumber: number;
  customerName: string;
  customerPhone: string;
  items: OrderItemEntry[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  cgst: number;
  sgst: number;
  totalTax: number;
  payableAmount: number;
  paymentMode: 'Cash' | 'UPI' | 'Credit Card' | 'Debit Card';
  paidAt: string;
  cashier: string;
}

export const INITIAL_MENU_ITEMS: MenuItemData[] = [
  // Starters
  {
    id: 101,
    name: 'Paneer Tikka Charcoal',
    category: 'Starters',
    price: 260,
    isVeg: true,
    description: 'Fresh cottage cheese cubes marinated in spiced hung curd and chargrilled in tandoor.',
    preparationTimeMinutes: 15,
    isAvailable: true,
    specialBadge: 'Chef Special',
  },
  {
    id: 102,
    name: 'Crispy Salt & Pepper Corn',
    category: 'Starters',
    price: 190,
    isVeg: true,
    description: 'Golden fried tender sweet corn kernels tossed with peppers, herbs, and oriental spices.',
    preparationTimeMinutes: 10,
    isAvailable: true,
  },
  {
    id: 103,
    name: 'Mughlai Chicken Seekh Kebab',
    category: 'Starters',
    price: 320,
    isVeg: false,
    description: 'Minced chicken blended with royal Indian spices, skewered and tandoor roasted.',
    preparationTimeMinutes: 20,
    isAvailable: true,
    specialBadge: 'Popular',
  },
  {
    id: 104,
    name: 'Dahi Ke Kebab',
    category: 'Starters',
    price: 230,
    isVeg: true,
    description: 'Velvety hung curd patties with green chilies, coriander, and crispy exterior.',
    preparationTimeMinutes: 12,
    isAvailable: true,
  },
  {
    id: 105,
    name: 'Tandoori Garlic Wings',
    category: 'Starters',
    price: 290,
    isVeg: false,
    description: 'Crispy chicken wings glazed with roasted garlic tandoori marinade.',
    preparationTimeMinutes: 18,
    isAvailable: true,
  },

  // Main Course
  {
    id: 201,
    name: 'Paneer Butter Masala',
    category: 'Main Course',
    price: 280,
    isVeg: true,
    description: 'Rich and creamy tomato-cashew gravy with melt-in-mouth cottage cheese and kasuri methi.',
    preparationTimeMinutes: 20,
    isAvailable: true,
    specialBadge: 'Bestseller',
  },
  {
    id: 202,
    name: 'Dal Makhani Heritage',
    category: 'Main Course',
    price: 240,
    isVeg: true,
    description: 'Slow-cooked black lentils simmered overnight with butter, cream, and aromatic spices.',
    preparationTimeMinutes: 15,
    isAvailable: true,
    specialBadge: 'Signature',
  },
  {
    id: 203,
    name: 'Murgh Makhani (Butter Chicken)',
    category: 'Main Course',
    price: 360,
    isVeg: false,
    description: 'Tender pulled tandoori chicken cooked in velvety butter-tomato satin gravy.',
    preparationTimeMinutes: 22,
    isAvailable: true,
    specialBadge: 'Bestseller',
  },
  {
    id: 204,
    name: 'Kadhai Paneer Dhaba Style',
    category: 'Main Course',
    price: 270,
    isVeg: true,
    description: 'Cottage cheese and bell peppers stir-fried in freshly ground coriander-seed kadhai gravy.',
    preparationTimeMinutes: 18,
    isAvailable: true,
  },
  {
    id: 205,
    name: 'Hyderabadi Chicken Dum Biryani',
    category: 'Main Course',
    price: 340,
    isVeg: false,
    description: 'Fragrant basmati rice layered with spiced marinated chicken, saffron, and fried onions.',
    preparationTimeMinutes: 25,
    isAvailable: true,
    specialBadge: 'Chef Special',
  },
  {
    id: 206,
    name: 'Subz Dum Biryani',
    category: 'Main Course',
    price: 260,
    isVeg: true,
    description: 'Assorted seasonal garden vegetables layered with aged basmati rice and rose water.',
    preparationTimeMinutes: 20,
    isAvailable: true,
  },

  // Breads
  {
    id: 301,
    name: 'Butter Naan',
    category: 'Breads',
    price: 50,
    isVeg: true,
    description: 'Traditional leavened flatbread baked in clay oven, brushed with pure butter.',
    preparationTimeMinutes: 6,
    isAvailable: true,
  },
  {
    id: 302,
    name: 'Garlic & Herb Naan',
    category: 'Breads',
    price: 65,
    isVeg: true,
    description: 'Tandoori naan topped with chopped charred garlic and fresh coriander.',
    preparationTimeMinutes: 7,
    isAvailable: true,
    specialBadge: 'Favorite',
  },
  {
    id: 303,
    name: 'Tandoori Roti (Whole Wheat)',
    category: 'Breads',
    price: 25,
    isVeg: true,
    description: 'Crisp whole wheat unleavened bread baked fresh in the tandoor.',
    preparationTimeMinutes: 5,
    isAvailable: true,
  },
  {
    id: 304,
    name: 'Chilli Cheese Naan',
    category: 'Breads',
    price: 90,
    isVeg: true,
    description: 'Gooey mozzarella stuffed naan with minced green chilies and oregano seasoning.',
    preparationTimeMinutes: 8,
    isAvailable: true,
  },

  // Beverages
  {
    id: 401,
    name: 'Royal Kesariya Sweet Lassi',
    category: 'Beverages',
    price: 90,
    isVeg: true,
    description: 'Thick churned creamy yogurt drink infused with saffron, cardamom, and pistachio slivers.',
    preparationTimeMinutes: 5,
    isAvailable: true,
    specialBadge: 'Summer Special',
  },
  {
    id: 402,
    name: 'Alphonso Mango Milkshake',
    category: 'Beverages',
    price: 130,
    isVeg: true,
    description: 'Real Alphonso mango pulp blended with rich milk and vanilla bean ice cream.',
    preparationTimeMinutes: 6,
    isAvailable: true,
  },
  {
    id: 403,
    name: 'Fresh Mint & Lime Soda',
    category: 'Beverages',
    price: 70,
    isVeg: true,
    description: 'Zesty fresh lemon juice, crushed garden mint, and chilled sparkling soda.',
    preparationTimeMinutes: 4,
    isAvailable: true,
  },
  {
    id: 404,
    name: 'Filter Coffee / Masala Chai',
    category: 'Beverages',
    price: 45,
    isVeg: true,
    description: 'Authentic Indian hot beverage prepared fresh with whole spices or roasted chicory blend.',
    preparationTimeMinutes: 5,
    isAvailable: true,
  },

  // Desserts
  {
    id: 501,
    name: 'Shahi Gulab Jamun (2 Pcs)',
    category: 'Desserts',
    price: 80,
    isVeg: true,
    description: 'Warm golden milk dumplings soaked in cardamom and rose water sugar syrup.',
    preparationTimeMinutes: 5,
    isAvailable: true,
  },
  {
    id: 502,
    name: 'Kesar Rasmalai (2 Pcs)',
    category: 'Desserts',
    price: 110,
    isVeg: true,
    description: 'Spongy cottage cheese patties immersed in chilled saffron rabdi garnished with almonds.',
    preparationTimeMinutes: 5,
    isAvailable: true,
    specialBadge: 'Popular',
  },
  {
    id: 503,
    name: 'Sizzling Brownie with Vanilla Scoop',
    category: 'Desserts',
    price: 160,
    isVeg: true,
    description: 'Gooey walnut brownie served on a smoking hot iron plate with melted Belgian fudge sauce.',
    preparationTimeMinutes: 8,
    isAvailable: true,
  },

  // Combos
  {
    id: 601,
    name: 'Royal Maharaja Thali',
    category: 'Combos',
    price: 399,
    isVeg: true,
    description: 'Complete platter: Paneer Butter Masala, Dal Makhani, 2 Butter Naan, Jeera Rice, Gulab Jamun, and Raita.',
    preparationTimeMinutes: 20,
    isAvailable: true,
    specialBadge: 'Value Deal',
  },
  {
    id: 602,
    name: 'Tandoori Feast Combo (Non-Veg)',
    category: 'Combos',
    price: 549,
    isVeg: false,
    description: 'Chicken Tikka, Chicken Biryani, Butter Chicken, 2 Garlic Naan, Salad, and Kesar Phirni.',
    preparationTimeMinutes: 25,
    isAvailable: true,
    specialBadge: 'Chef Selection',
  },
];

export const INITIAL_TABLES: RestaurantTableData[] = [
  { id: 1, tableNumber: 1, capacity: 2, status: 'AVAILABLE' },
  {
    id: 2,
    tableNumber: 2,
    capacity: 4,
    status: 'OCCUPIED',
    currentOrderId: 1001,
    assignedCustomer: 'Vikram Malhotra',
    seatedSince: '12:15 PM',
  },
  {
    id: 3,
    tableNumber: 3,
    capacity: 4,
    status: 'BILLING',
    currentOrderId: 1002,
    assignedCustomer: 'Pooja Agarwal',
    seatedSince: '12:00 PM',
  },
  { id: 4, tableNumber: 4, capacity: 6, status: 'AVAILABLE' },
  { id: 5, tableNumber: 5, capacity: 2, status: 'RESERVED', assignedCustomer: 'Kavita Reddy' },
  {
    id: 6,
    tableNumber: 6,
    capacity: 8,
    status: 'OCCUPIED',
    currentOrderId: 1003,
    assignedCustomer: 'Rohan Deshmukh',
    seatedSince: '12:25 PM',
  },
  { id: 7, tableNumber: 7, capacity: 4, status: 'AVAILABLE' },
  { id: 8, tableNumber: 8, capacity: 4, status: 'AVAILABLE' },
];

export const INITIAL_CUSTOMERS: CustomerData[] = [
  {
    id: 1,
    name: 'Vikram Malhotra',
    phone: '9820112233',
    email: 'vikram.malhotra@gmail.com',
    loyaltyPoints: 340,
    totalVisits: 14,
    totalSpent: 9840,
    joinedDate: '2026-03-12',
  },
  {
    id: 2,
    name: 'Pooja Agarwal',
    phone: '9819445566',
    email: 'pooja.agarwal@outlook.com',
    loyaltyPoints: 180,
    totalVisits: 8,
    totalSpent: 5200,
    joinedDate: '2026-05-18',
  },
  {
    id: 3,
    name: 'Rohan Deshmukh',
    phone: '9876501234',
    email: 'rohan.desh@gmail.com',
    loyaltyPoints: 520,
    totalVisits: 22,
    totalSpent: 16750,
    joinedDate: '2026-01-05',
  },
  {
    id: 4,
    name: 'Ananya Sharma',
    phone: '9845112299',
    email: 'ananya.s@yahoo.com',
    loyaltyPoints: 75,
    totalVisits: 3,
    totalSpent: 2150,
    joinedDate: '2026-08-14',
  },
  {
    id: 5,
    name: 'Sameer Verma',
    phone: '9988776655',
    email: 's.verma@corp.in',
    loyaltyPoints: 410,
    totalVisits: 19,
    totalSpent: 13400,
    joinedDate: '2026-02-28',
  },
];

export const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: 1001,
    tableNumber: 2,
    customerName: 'Vikram Malhotra',
    customerPhone: '9820112233',
    status: 'SERVED',
    items: [
      { item: INITIAL_MENU_ITEMS[0], quantity: 1, notes: 'Medium spice' },
      { item: INITIAL_MENU_ITEMS[5], quantity: 1 },
      { item: INITIAL_MENU_ITEMS[11], quantity: 2 },
      { item: INITIAL_MENU_ITEMS[15], quantity: 2 },
    ],
    subtotal: 750,
    createdAt: '12:15 PM',
  },
  {
    id: 1002,
    tableNumber: 3,
    customerName: 'Pooja Agarwal',
    customerPhone: '9819445566',
    status: 'IN_KITCHEN',
    items: [
      { item: INITIAL_MENU_ITEMS[7], quantity: 1 },
      { item: INITIAL_MENU_ITEMS[9], quantity: 1 },
      { item: INITIAL_MENU_ITEMS[12], quantity: 2 },
    ],
    subtotal: 830,
    createdAt: '12:00 PM',
  },
  {
    id: 1003,
    tableNumber: 6,
    customerName: 'Rohan Deshmukh',
    customerPhone: '9876501234',
    status: 'IN_KITCHEN',
    items: [
      { item: INITIAL_MENU_ITEMS[21], quantity: 2, notes: 'Family get-together' },
      { item: INITIAL_MENU_ITEMS[16], quantity: 3 },
      { item: INITIAL_MENU_ITEMS[19], quantity: 3 },
    ],
    subtotal: 1818,
    createdAt: '12:25 PM',
  },
];

export const INITIAL_BILLS: BillRecord[] = [
  {
    billId: 'BILL-20261031-001',
    orderId: 998,
    tableNumber: 1,
    customerName: 'Sameer Verma',
    customerPhone: '9988776655',
    items: [
      { item: INITIAL_MENU_ITEMS[5], quantity: 1 },
      { item: INITIAL_MENU_ITEMS[11], quantity: 2 },
      { item: INITIAL_MENU_ITEMS[15], quantity: 1 },
    ],
    subtotal: 470,
    discountPercent: 10,
    discountAmount: 47,
    cgst: 10.58,
    sgst: 10.58,
    totalTax: 21.16,
    payableAmount: 444,
    paymentMode: 'UPI',
    paidAt: '11:42 AM',
    cashier: 'Admin (Desktop POS)',
  },
  {
    billId: 'BILL-20261031-002',
    orderId: 999,
    tableNumber: 4,
    customerName: 'Ananya Sharma',
    customerPhone: '9845112299',
    items: [
      { item: INITIAL_MENU_ITEMS[20], quantity: 2 },
      { item: INITIAL_MENU_ITEMS[16], quantity: 2 },
    ],
    subtotal: 1058,
    discountPercent: 0,
    discountAmount: 0,
    cgst: 26.45,
    sgst: 26.45,
    totalTax: 52.9,
    payableAmount: 1111,
    paymentMode: 'Credit Card',
    paidAt: '11:58 AM',
    cashier: 'Admin (Desktop POS)',
  },
];
