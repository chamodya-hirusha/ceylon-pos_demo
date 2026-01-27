// Demo data for Hardware POS System

export interface Product {
  id: string;
  name: string;
  nameSinhala?: string;
  sku: string;
  barcode: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  unit: 'pcs' | 'kg' | 'ft' | 'inch' | 'box' | 'ltr' | 'meter';
  minStock: number;
  supplier?: string;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  nameSinhala: string;
  icon: string;
  color: string;
}

export interface Cashier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  pin: string;
  role: 'admin' | 'manager' | 'cashier';
  active: boolean;
  joinDate?: string;
  shortcuts?: Record<string, string>;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'credit';
  cashierId: string;
  cashierName: string;
  timestamp: Date;
  customerId?: string;
}

export interface ReturnSale {
  id: string;
  originalSaleId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  cashierId: string;
  cashierName: string;
  reason?: string;
  timestamp: Date;
}

export const categories: Category[] = [
  { id: 'all', name: 'All Products', nameSinhala: 'සියලු භාණ්ඩ', icon: '📦', color: '#4DA3FF' },
  { id: 'building', name: 'Building Materials', nameSinhala: 'ගොඩනැගිලි ද්‍රව්‍ය', icon: '🏗️', color: '#6B7280' },
  { id: 'fasteners', name: 'Nuts & Bolts', nameSinhala: 'නට් සහ බෝල්ට්', icon: '🔩', color: '#8B5CF6' },
  { id: 'handtools', name: 'Hand Tools', nameSinhala: 'අත් මෙවලම්', icon: '🧰', color: '#F59E0B' },
  { id: 'powertools', name: 'Power Tools', nameSinhala: 'බල මෙවලම්', icon: '⚙️', color: '#EF4444' },
  { id: 'electrical', name: 'Electrical', nameSinhala: 'විදුලි භාණ්ඩ', icon: '🔌', color: '#10B981' },
  { id: 'plumbing', name: 'Plumbing', nameSinhala: 'නල කාර්මික', icon: '🚰', color: '#3B82F6' },
  { id: 'paint', name: 'Paint', nameSinhala: 'තීන්ත', icon: '🎨', color: '#EC4899' },
  { id: 'wood', name: 'Wood & Fittings', nameSinhala: 'ලී සහ සවිකරණ', icon: '🪵', color: '#A16207' },
  { id: 'tiles', name: 'Tiles & Flooring', nameSinhala: 'ටයිල් සහ බිම්', icon: '🧱', color: '#DC2626' },
  { id: 'safety', name: 'Safety Equipment', nameSinhala: 'ආරක්ෂක උපකරණ', icon: '🧯', color: '#F97316' },
  { id: 'other', name: 'Other Hardware', nameSinhala: 'වෙනත් දෘඩාංග', icon: '🔧', color: '#6366F1' },
];

export const products: Product[] = [
  // Building Materials
  { id: '1', name: 'Cement Bag 50kg', nameSinhala: 'සිමෙන්ති බෑගය 50kg', sku: 'BLD001', barcode: '8901234567001', category: 'building', price: 2350, cost: 2100, stock: 150, unit: 'pcs', minStock: 20, supplier: 'Tokyo Cement' },
  { id: '2', name: 'Sand - River (Cube)', nameSinhala: 'වැලි - ගං (ඝන)', sku: 'BLD002', barcode: '8901234567002', category: 'building', price: 28000, cost: 24000, stock: 45, unit: 'pcs', minStock: 10 },
  { id: '3', name: 'Metal 3/4 (Cube)', nameSinhala: 'ලෝහ 3/4 (ඝන)', sku: 'BLD003', barcode: '8901234567003', category: 'building', price: 32000, cost: 28000, stock: 30, unit: 'pcs', minStock: 5 },
  { id: '4', name: 'Brick Red Clay', nameSinhala: 'ගඩොල් රතු මැටි', sku: 'BLD004', barcode: '8901234567004', category: 'building', price: 45, cost: 35, stock: 5000, unit: 'pcs', minStock: 500 },
  { id: '5', name: 'Cement Block 4"', nameSinhala: 'සිමෙන්ති කොට්ට 4"', sku: 'BLD005', barcode: '8901234567005', category: 'building', price: 85, cost: 65, stock: 2000, unit: 'pcs', minStock: 200 },

  // Nuts & Bolts
  { id: '6', name: 'Hex Bolt M8x50mm', nameSinhala: 'හෙක්ස් බෝල්ට් M8x50mm', sku: 'FST001', barcode: '8901234567006', category: 'fasteners', price: 25, cost: 15, stock: 500, unit: 'pcs', minStock: 100 },
  { id: '7', name: 'Hex Nut M8', nameSinhala: 'හෙක්ස් නට් M8', sku: 'FST002', barcode: '8901234567007', category: 'fasteners', price: 8, cost: 4, stock: 1000, unit: 'pcs', minStock: 200 },
  { id: '8', name: 'Washer Flat M8', nameSinhala: 'වොෂර් M8', sku: 'FST003', barcode: '8901234567008', category: 'fasteners', price: 5, cost: 2, stock: 1500, unit: 'pcs', minStock: 300 },
  { id: '9', name: 'Rawl Bolt 10mm', nameSinhala: 'රෝල් බෝල්ට් 10mm', sku: 'FST004', barcode: '8901234567009', category: 'fasteners', price: 45, cost: 30, stock: 300, unit: 'pcs', minStock: 50 },
  { id: '10', name: 'Wood Screw 2" Box', nameSinhala: 'ලී ඉස්කුරුප්පු 2" පෙට්ටිය', sku: 'FST005', barcode: '8901234567010', category: 'fasteners', price: 350, cost: 250, stock: 100, unit: 'box', minStock: 20 },

  // Hand Tools
  { id: '11', name: 'Claw Hammer 16oz', nameSinhala: 'මිටිය 16oz', sku: 'HND001', barcode: '8901234567011', category: 'handtools', price: 850, cost: 600, stock: 25, unit: 'pcs', minStock: 5 },
  { id: '12', name: 'Screwdriver Set 6pcs', nameSinhala: 'ස්ක්‍රූඩ්‍රයිවර් කට්ටලය 6pcs', sku: 'HND002', barcode: '8901234567012', category: 'handtools', price: 1200, cost: 850, stock: 30, unit: 'pcs', minStock: 5 },
  { id: '13', name: 'Adjustable Spanner 12"', nameSinhala: 'ස්පැනර් 12"', sku: 'HND003', barcode: '8901234567013', category: 'handtools', price: 950, cost: 700, stock: 20, unit: 'pcs', minStock: 3 },
  { id: '14', name: 'Combination Pliers 8"', nameSinhala: 'ප්ලයර්ස් 8"', sku: 'HND004', barcode: '8901234567014', category: 'handtools', price: 650, cost: 450, stock: 35, unit: 'pcs', minStock: 5 },
  { id: '15', name: 'Hacksaw Frame', nameSinhala: 'හැක්සෝ රාමුව', sku: 'HND005', barcode: '8901234567015', category: 'handtools', price: 550, cost: 380, stock: 15, unit: 'pcs', minStock: 3 },

  // Power Tools
  { id: '16', name: 'Drill Machine 13mm', nameSinhala: 'ඩ්‍රිල් යන්ත්‍රය 13mm', sku: 'PWR001', barcode: '8901234567016', category: 'powertools', price: 8500, cost: 6500, stock: 8, unit: 'pcs', minStock: 2 },
  { id: '17', name: 'Angle Grinder 4"', nameSinhala: 'ඇංගල් ග්‍රයින්ඩර් 4"', sku: 'PWR002', barcode: '8901234567017', category: 'powertools', price: 6500, cost: 5000, stock: 12, unit: 'pcs', minStock: 2 },
  { id: '18', name: 'Welding Machine 200A', nameSinhala: 'වෙල්ඩින් යන්ත්‍රය 200A', sku: 'PWR003', barcode: '8901234567018', category: 'powertools', price: 35000, cost: 28000, stock: 5, unit: 'pcs', minStock: 1 },
  { id: '19', name: 'Circular Saw 7"', nameSinhala: 'චක්‍රලේඛ කියත 7"', sku: 'PWR004', barcode: '8901234567019', category: 'powertools', price: 12500, cost: 9500, stock: 6, unit: 'pcs', minStock: 1 },

  // Electrical
  { id: '20', name: 'Wire 1.5mm (100m)', nameSinhala: 'වයර් 1.5mm (100m)', sku: 'ELC001', barcode: '8901234567020', category: 'electrical', price: 4500, cost: 3500, stock: 25, unit: 'pcs', minStock: 5 },
  { id: '21', name: 'Switch Socket Combined', nameSinhala: 'ස්විචය සොකට් එක්ක', sku: 'ELC002', barcode: '8901234567021', category: 'electrical', price: 350, cost: 250, stock: 100, unit: 'pcs', minStock: 20 },
  { id: '22', name: 'MCB 32A Single', nameSinhala: 'MCB 32A තනි', sku: 'ELC003', barcode: '8901234567022', category: 'electrical', price: 850, cost: 650, stock: 40, unit: 'pcs', minStock: 10 },
  { id: '23', name: 'LED Bulb 12W', nameSinhala: 'LED බල්බ් 12W', sku: 'ELC004', barcode: '8901234567023', category: 'electrical', price: 450, cost: 320, stock: 80, unit: 'pcs', minStock: 20 },
  { id: '24', name: 'Distribution Board 4-Way', nameSinhala: 'බෙදාහැරීම් පුවරුව 4-Way', sku: 'ELC005', barcode: '8901234567024', category: 'electrical', price: 2500, cost: 1900, stock: 15, unit: 'pcs', minStock: 3 },

  // Plumbing
  { id: '25', name: 'PVC Pipe 3" (10ft)', nameSinhala: 'PVC නළය 3" (10ft)', sku: 'PLB001', barcode: '8901234567025', category: 'plumbing', price: 850, cost: 650, stock: 50, unit: 'pcs', minStock: 10 },
  { id: '26', name: 'GI Pipe 1" (20ft)', nameSinhala: 'GI නළය 1" (20ft)', sku: 'PLB002', barcode: '8901234567026', category: 'plumbing', price: 3500, cost: 2800, stock: 30, unit: 'pcs', minStock: 5 },
  { id: '27', name: 'Ball Valve 1"', nameSinhala: 'බෝල් වෑල්ව 1"', sku: 'PLB003', barcode: '8901234567027', category: 'plumbing', price: 650, cost: 480, stock: 35, unit: 'pcs', minStock: 10 },
  { id: '28', name: 'Tap Brass Chrome', nameSinhala: 'ටැප් පිත්තල ක්‍රෝම්', sku: 'PLB004', barcode: '8901234567028', category: 'plumbing', price: 1200, cost: 900, stock: 25, unit: 'pcs', minStock: 5 },
  { id: '29', name: 'Commode Complete Set', nameSinhala: 'කොමෝඩ් සම්පූර්ණ කට්ටලය', sku: 'PLB005', barcode: '8901234567029', category: 'plumbing', price: 18500, cost: 14500, stock: 8, unit: 'pcs', minStock: 2 },

  // Paint
  { id: '30', name: 'Emulsion Paint 4L White', nameSinhala: 'එමල්ෂන් තීන්ත 4L සුදු', sku: 'PNT001', barcode: '8901234567030', category: 'paint', price: 3500, cost: 2700, stock: 40, unit: 'pcs', minStock: 10 },
  { id: '31', name: 'Enamel Paint 1L', nameSinhala: 'එනමල් තීන්ත 1L', sku: 'PNT002', barcode: '8901234567031', category: 'paint', price: 1200, cost: 900, stock: 60, unit: 'pcs', minStock: 15 },
  { id: '32', name: 'Primer 4L', nameSinhala: 'ප්‍රයිමර් 4L', sku: 'PNT003', barcode: '8901234567032', category: 'paint', price: 2800, cost: 2100, stock: 25, unit: 'pcs', minStock: 5 },
  { id: '33', name: 'Paint Brush 4"', nameSinhala: 'තීන්ත බුරුසුව 4"', sku: 'PNT004', barcode: '8901234567033', category: 'paint', price: 250, cost: 150, stock: 50, unit: 'pcs', minStock: 10 },
  { id: '34', name: 'Paint Roller 9"', nameSinhala: 'තීන්ත රෝලරය 9"', sku: 'PNT005', barcode: '8901234567034', category: 'paint', price: 450, cost: 300, stock: 30, unit: 'pcs', minStock: 5 },

  // Wood & Fittings
  { id: '35', name: 'Plywood 8x4 12mm', nameSinhala: 'ප්ලයිවුඩ් 8x4 12mm', sku: 'WOD001', barcode: '8901234567035', category: 'wood', price: 4500, cost: 3500, stock: 20, unit: 'pcs', minStock: 5 },
  { id: '36', name: 'MDF Board 8x4 16mm', nameSinhala: 'MDF බෝඩ් 8x4 16mm', sku: 'WOD002', barcode: '8901234567036', category: 'wood', price: 5500, cost: 4200, stock: 15, unit: 'pcs', minStock: 3 },
  { id: '37', name: 'Door Hinge 4" SS', nameSinhala: 'දොර හින්ජ් 4" SS', sku: 'WOD003', barcode: '8901234567037', category: 'wood', price: 350, cost: 250, stock: 100, unit: 'pcs', minStock: 20 },
  { id: '38', name: 'Door Lock Mortise', nameSinhala: 'දොර අගුල', sku: 'WOD004', barcode: '8901234567038', category: 'wood', price: 1800, cost: 1400, stock: 25, unit: 'pcs', minStock: 5 },
  { id: '39', name: 'Drawer Slide 18" Pair', nameSinhala: 'ඩ්‍රෝවර් ස්ලයිඩ් 18"', sku: 'WOD005', barcode: '8901234567039', category: 'wood', price: 650, cost: 480, stock: 40, unit: 'pcs', minStock: 10 },

  // Tiles
  { id: '40', name: 'Floor Tile 2x2 White', nameSinhala: 'බිම් ටයිල් 2x2 සුදු', sku: 'TIL001', barcode: '8901234567040', category: 'tiles', price: 350, cost: 280, stock: 500, unit: 'pcs', minStock: 50 },
  { id: '41', name: 'Wall Tile 1x1 Ceramic', nameSinhala: 'බිත්ති ටයිල් 1x1', sku: 'TIL002', barcode: '8901234567041', category: 'tiles', price: 180, cost: 130, stock: 800, unit: 'pcs', minStock: 100 },
  { id: '42', name: 'Tile Adhesive 20kg', nameSinhala: 'ටයිල් මැලියම් 20kg', sku: 'TIL003', barcode: '8901234567042', category: 'tiles', price: 1800, cost: 1400, stock: 60, unit: 'pcs', minStock: 10 },
  { id: '43', name: 'Tile Grout 5kg White', nameSinhala: 'ටයිල් ග්‍රවුට් 5kg', sku: 'TIL004', barcode: '8901234567043', category: 'tiles', price: 850, cost: 650, stock: 40, unit: 'pcs', minStock: 10 },

  // Safety Equipment
  { id: '44', name: 'Safety Helmet Yellow', nameSinhala: 'ආරක්ෂක හෙල්මට් කහ', sku: 'SFT001', barcode: '8901234567044', category: 'safety', price: 650, cost: 450, stock: 30, unit: 'pcs', minStock: 5 },
  { id: '45', name: 'Safety Gloves Pair', nameSinhala: 'ආරක්ෂක අත්වැසුම්', sku: 'SFT002', barcode: '8901234567045', category: 'safety', price: 250, cost: 150, stock: 50, unit: 'pcs', minStock: 10 },
  { id: '46', name: 'Safety Shoes Size 42', nameSinhala: 'ආරක්ෂක සපත්තු 42', sku: 'SFT003', barcode: '8901234567046', category: 'safety', price: 3500, cost: 2700, stock: 15, unit: 'pcs', minStock: 3 },
  { id: '47', name: 'Dust Mask N95', nameSinhala: 'දූවිලි මාස්ක් N95', sku: 'SFT004', barcode: '8901234567047', category: 'safety', price: 85, cost: 50, stock: 200, unit: 'pcs', minStock: 50 },
  { id: '48', name: 'Safety Goggles Clear', nameSinhala: 'ආරක්ෂක කණ්නාඩි', sku: 'SFT005', barcode: '8901234567048', category: 'safety', price: 450, cost: 300, stock: 25, unit: 'pcs', minStock: 5 },

  // Other Hardware
  { id: '49', name: 'Silicone Sealant 280ml', nameSinhala: 'සිලිකන් 280ml', sku: 'OTH001', barcode: '8901234567049', category: 'other', price: 650, cost: 480, stock: 45, unit: 'pcs', minStock: 10 },
  { id: '50', name: 'Cable Ties 100pcs', nameSinhala: 'කේබල් ටයි 100pcs', sku: 'OTH002', barcode: '8901234567050', category: 'other', price: 180, cost: 100, stock: 100, unit: 'pcs', minStock: 20 },
  { id: '51', name: 'Rubber Hose 1/2" (meter)', nameSinhala: 'රබර් නළය 1/2"', sku: 'OTH003', barcode: '8901234567051', category: 'other', price: 150, cost: 100, stock: 200, unit: 'meter', minStock: 30 },
  { id: '52', name: 'Super Glue 3g', nameSinhala: 'සුපර් මැලියම් 3g', sku: 'OTH004', barcode: '8901234567052', category: 'other', price: 120, cost: 70, stock: 80, unit: 'pcs', minStock: 20 },
];

export const cashiers: Cashier[] = [
  { id: 'ADM001', name: 'Admin User', pin: '0000', role: 'admin', active: true },
  { id: 'MGR001', name: 'Store Manager', pin: '9999', role: 'manager', active: true },
  { id: 'C001', name: 'Kasun Perera', pin: '1234', role: 'cashier', active: true },
  { id: 'C002', name: 'Nimali Silva', pin: '5678', role: 'cashier', active: true },
  { id: 'C003', name: 'Ruwan Fernando', pin: '9012', role: 'cashier', active: true },
];

// Demo sales data
export const generateDemoSales = (): Sale[] => {
  const sales: Sale[] = [];
  const now = new Date();

  for (let i = 0; i < 50; i++) {
    const numItems = Math.floor(Math.random() * 5) + 1;
    const items: CartItem[] = [];
    let subtotal = 0;

    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      const discount = Math.random() > 0.8 ? Math.floor(Math.random() * 10) : 0;
      items.push({ product, quantity, discount });
      subtotal += product.price * quantity * (1 - discount / 100);
    }

    const cashier = cashiers[Math.floor(Math.random() * cashiers.length)];
    const saleDiscount = Math.random() > 0.9 ? Math.floor(Math.random() * 5) : 0;
    const tax = subtotal * 0.08;
    const total = (subtotal - (subtotal * saleDiscount / 100)) + tax;

    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 10) + 8;
    const saleDate = new Date(now);
    saleDate.setDate(saleDate.getDate() - daysAgo);
    saleDate.setHours(hoursAgo, Math.floor(Math.random() * 60), 0, 0);

    sales.push({
      id: `SALE-${String(i + 1).padStart(5, '0')}`,
      items,
      subtotal,
      discount: saleDiscount,
      tax,
      total,
      paymentMethod: ['cash', 'card', 'credit'][Math.floor(Math.random() * 3)] as 'cash' | 'card' | 'credit',
      cashierId: cashier.id,
      cashierName: cashier.name,
      timestamp: saleDate,
    });
  }

  return sales.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const generateDemoReturns = (sales: Sale[]): ReturnSale[] => {
  const returns: ReturnSale[] = [];
  const now = new Date();

  // Generate returns for about 10% of sales
  const salesToReturn = sales.slice(0, 5);

  salesToReturn.forEach((sale, i) => {
    // Partial return: take the first item
    const returnedItems = [sale.items[0]];
    const subtotal = returnedItems.reduce((sum, item) => {
      const itemTotal = item.product.price * item.quantity;
      const itemDiscount = itemTotal * (item.discount / 100);
      return sum + (itemTotal - itemDiscount);
    }, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    returns.push({
      id: `RET-${String(i + 1).padStart(5, '0')}`,
      originalSaleId: sale.id,
      items: returnedItems,
      subtotal,
      tax,
      total,
      cashierId: sale.cashierId,
      cashierName: sale.cashierName,
      timestamp: new Date(sale.timestamp.getTime() + 86400000), // 1 day later
    });
  });

  return returns;
};
