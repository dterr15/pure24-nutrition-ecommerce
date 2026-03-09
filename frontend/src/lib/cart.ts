// Cart management with localStorage
import type { Product } from '@shared/types';

export interface CartItem {
  product: Product;
  quantity: number;
  priceAtAddTime: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  lastUpdated: Date;
}

const CART_KEY = 'pure24_cart';
const DEFAULT_SHIPPING = 5000; // CLP

export const cart = {
  // Get current cart from localStorage
  get(): Cart {
    if (typeof window === 'undefined') {
      return { items: [], subtotal: 0, shippingCost: DEFAULT_SHIPPING, discount: 0, total: 0, lastUpdated: new Date() };
    }

    try {
      const stored = localStorage.getItem(CART_KEY);
      if (!stored) {
        return { items: [], subtotal: 0, shippingCost: DEFAULT_SHIPPING, discount: 0, total: 0, lastUpdated: new Date() };
      }
      return JSON.parse(stored);
    } catch (err) {
      console.error('❌ Error reading cart from localStorage:', err);
      return { items: [], subtotal: 0, shippingCost: DEFAULT_SHIPPING, discount: 0, total: 0, lastUpdated: new Date() };
    }
  },

  // Save cart to localStorage and dispatch custom event
  save(cart: Cart): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
    } catch (err) {
      console.error('❌ Error saving cart to localStorage:', err);
    }
  },

  // Add product to cart
  add(product: Product, quantity: number = 1): Cart {
    const current = this.get();
    const existingItem = current.items.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      current.items.push({
        product,
        quantity,
        priceAtAddTime: product.discountedPrice || product.price,
      });
    }

    this.recalculate(current);
    this.save(current);
    return current;
  },

  // Remove product from cart
  remove(productId: string): Cart {
    const current = this.get();
    current.items = current.items.filter(item => item.product.id !== productId);
    this.recalculate(current);
    this.save(current);
    return current;
  },

  // Update quantity
  updateQuantity(productId: string, quantity: number): Cart {
    const current = this.get();
    const item = current.items.find(i => i.product.id === productId);

    if (item) {
      if (quantity <= 0) {
        return this.remove(productId);
      }
      item.quantity = quantity;
      this.recalculate(current);
      this.save(current);
    }

    return current;
  },

  // Clear entire cart
  clear(): Cart {
    const empty: Cart = {
      items: [],
      subtotal: 0,
      shippingCost: DEFAULT_SHIPPING,
      discount: 0,
      total: 0,
      lastUpdated: new Date(),
    };
    this.save(empty);
    return empty;
  },

  // Recalculate totals
  private recalculate(cart: Cart): void {
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.priceAtAddTime * item.quantity, 0);
    cart.total = cart.subtotal + cart.shippingCost - cart.discount;
    cart.lastUpdated = new Date();
  },

  // Get item count
  getCount(): number {
    return this.get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  // Check if product is in cart
  hasProduct(productId: string): boolean {
    return this.get().items.some(item => item.product.id === productId);
  },

  // Get quantity of specific product
  getQuantity(productId: string): number {
    const item = this.get().items.find(i => i.product.id === productId);
    return item?.quantity || 0;
  },
};
