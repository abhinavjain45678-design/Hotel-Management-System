import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSubtotal,
  calculateBilling,
  validateCustomer,
  formatAsciiReceipt,
  type OrderItemCalculation,
} from './billingRules';

test('calculateSubtotal handles empty or populated items correctly', () => {
  assert.equal(calculateSubtotal([]), 0);

  const items: OrderItemCalculation[] = [
    { id: 1, name: 'Paneer Butter Masala', price: 280, quantity: 2, category: 'Main Course' },
    { id: 2, name: 'Garlic Naan', price: 60, quantity: 4, category: 'Breads' },
  ];
  // 280*2 = 560, 60*4 = 240, Total = 800
  assert.equal(calculateSubtotal(items), 800);
});

test('calculateBilling applies 5% GST (2.5% CGST + 2.5% SGST) and discounts correctly', () => {
  const items: OrderItemCalculation[] = [
    { id: 1, name: 'Biryani Special', price: 350, quantity: 2, category: 'Main Course' }, // 700
    { id: 2, name: 'Mango Lassi', price: 100, quantity: 3, category: 'Beverages' }, // 300
  ];
  // Subtotal = 1000
  // 10% discount = 100, Taxable = 900
  // CGST 2.5% of 900 = 22.50
  // SGST 2.5% of 900 = 22.50
  // Total tax = 45.00
  // Grand total = 945.00
  const result = calculateBilling(items, 10, 0);

  assert.equal(result.subtotal, 1000);
  assert.equal(result.discountAmount, 100);
  assert.equal(result.taxableAmount, 900);
  assert.equal(result.cgstAmount, 22.5);
  assert.equal(result.sgstAmount, 22.5);
  assert.equal(result.totalTax, 45);
  assert.equal(result.payableAmount, 945);
});

test('validateCustomer verifies valid phone and name strings', () => {
  assert.equal(validateCustomer('Rajesh Kumar', '9876543210').valid, true);
  assert.equal(validateCustomer('R', '9876543210').valid, false);
  assert.equal(validateCustomer('Rajesh Kumar', '123').valid, false);
});

test('formatAsciiReceipt generates clean receipt format', () => {
  const items: OrderItemCalculation[] = [
    { id: 1, name: 'Veg Platter', price: 450, quantity: 1, category: 'Starters' },
  ];
  const summary = calculateBilling(items, 0, 0);
  const receipt = formatAsciiReceipt(
    'BILL-1001',
    101,
    4,
    'Amit Sharma',
    '9811223344',
    items,
    summary,
    'UPI',
    '2026-10-31 12:30 PM'
  );

  assert.match(receipt, /GRAND PALACE RESTAURANT & HOTEL/);
  assert.match(receipt, /BILL-1001/);
  assert.match(receipt, /Table 4/);
  assert.match(receipt, /Veg Platter/);
  assert.match(receipt, /NET PAYABLE AMOUNT/);
});
