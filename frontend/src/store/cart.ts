/**
 * Cart Store - Estado centralizado del carrito
 * Persistencia: localStorage
 * Eventos: CustomEvent para sincronización entre componentes
 *
 * Uso:
 * import { cartManager } from '@/store/cart';
 * cartManager.add(product, 1);
 */

import type { Product } from '@shared/types';

export interface CartItem {
  productId: string;
  productName: string;
  priceAtTime: number;
  quantity: number;
  mainImage?: string;
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  discountCode?: string;
  total: number;
  lastUpdated: Date;
}

const STORAGE_KEY = 'pure24_cart_v1';
const SHIPPING_BASE = 5000; // CLP
const SHIPPING_FREE_THRESHOLD = 100000; // CLP

// ============== CUPONES ==============
const VALID_COUPONS: Record<string, number> = {
  'DESCUENTO10': 0.10,
  'DESCUENTO20': 0.20,
  'BIENVENIDA15': 0.15,
  'VERANO25': 0.25,
};

// ============== EVENTOS PERSONALIZADOS ==============
export const CART_EVENTS = {
  ITEM_ADDED: 'cart:item-added',
  ITEM_REMOVED: 'cart:item-removed',
  QUANTITY_UPDATED: 'cart:quantity-updated',
  CLEARED: 'cart:cleared',
  COUPON_APPLIED: 'cart:coupon-applied',
  UPDATED: 'cart:updated',
} as const;

// ============== CART MANAGER ==============
class CartManager {
  private state: CartState;

  constructor() {
    this.state = this.loadFromStorage();
  }

  /**
   * Cargar carrito del localStorage
   */
  private loadFromStorage(): CartState {
    if (typeof window === 'undefined') {
      return this.getEmptyCart();
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return this.getEmptyCart();
      }
      const parsed = JSON.parse(stored) as CartState;
      console.log('🛒 Carrito cargado:', parsed.items.length, 'items');
      return parsed;
    } catch (error) {
      console.error('❌ Error cargando carrito:', error);
      return this.getEmptyCart();
    }
  }

  /**
   * Guardar carrito a localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.dispatchEvent(CART_EVENTS.UPDATED, this.state);
    } catch (error) {
      console.error('❌ Error guardando carrito:', error);
    }
  }

  /**
   * Disparar evento personalizado
   */
  private dispatchEvent(eventType: string, detail: any): void {
    if (typeof window === 'undefined') {
      return;
    }

    const event = new CustomEvent(eventType, {
      detail,
      bubbles: true,
      composed: true,
    });
    window.dispatchEvent(event);
  }

  /**
   * Estado vacío
   */
  private getEmptyCart(): CartState {
    return {
      items: [],
      subtotal: 0,
      shippingCost: 0,
      discount: 0,
      total: 0,
      lastUpdated: new Date(),
    };
  }

  /**
   * Recalcular totales
   */
  private calculateTotals(): void {
    // Subtotal
    this.state.subtotal = this.state.items.reduce(
      (sum, item) => sum + item.priceAtTime * item.quantity,
      0
    );

    // Envío: gratis si subtotal > threshold
    this.state.shippingCost = this.state.subtotal > SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_BASE;

    // Descuento: ya aplicado en applyCoupon()
    // No se modifica aquí

    // Total
    this.state.total = this.state.subtotal + this.state.shippingCost - this.state.discount;
    this.state.lastUpdated = new Date();
  }

  /**
   * Obtener estado actual
   */
  getState(): CartState {
    return { ...this.state };
  }

  /**
   * Agregar producto al carrito
   */
  add(product: Product, quantity: number = 1): CartState {
    if (quantity <= 0) {
      return this.state;
    }

    const existingItem = this.state.items.find((item) => item.productId === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
      console.log(`📦 ${product.name}: cantidad actualizada a ${existingItem.quantity}`);
      this.dispatchEvent(CART_EVENTS.QUANTITY_UPDATED, {
        productId: product.id,
        newQuantity: existingItem.quantity,
      });
    } else {
      const newItem: CartItem = {
        productId: product.id,
        productName: product.name,
        priceAtTime: product.discountedPrice || product.price,
        quantity,
        mainImage: typeof product.mainImage === 'string' ? product.mainImage : product.mainImage?.url,
      };
      this.state.items.push(newItem);
      console.log(`✅ ${product.name} agregado al carrito`);
      this.dispatchEvent(CART_EVENTS.ITEM_ADDED, newItem);
    }

    this.calculateTotals();
    this.saveToStorage();
    return this.state;
  }

  /**
   * Remover producto del carrito
   */
  remove(productId: string): CartState {
    const item = this.state.items.find((i) => i.productId === productId);
    this.state.items = this.state.items.filter((i) => i.productId !== productId);

    if (item) {
      console.log(`🗑️ ${item.productName} removido del carrito`);
      this.dispatchEvent(CART_EVENTS.ITEM_REMOVED, { productId, productName: item.productName });
    }

    this.calculateTotals();
    this.saveToStorage();
    return this.state;
  }

  /**
   * Actualizar cantidad de un item
   */
  updateQuantity(productId: string, quantity: number): CartState {
    if (quantity <= 0) {
      return this.remove(productId);
    }

    const item = this.state.items.find((i) => i.productId === productId);
    if (item) {
      item.quantity = quantity;
      console.log(`📊 Cantidad actualizada: ${item.productName} × ${quantity}`);
      this.dispatchEvent(CART_EVENTS.QUANTITY_UPDATED, { productId, newQuantity: quantity });
    }

    this.calculateTotals();
    this.saveToStorage();
    return this.state;
  }

  /**
   * Aplicar código de descuento
   */
  applyCoupon(code: string): { success: boolean; message: string } {
    const upperCode = code.toUpperCase().trim();

    if (!VALID_COUPONS[upperCode]) {
      return {
        success: false,
        message: `❌ Código "${code}" inválido o expirado`,
      };
    }

    const discountRate = VALID_COUPONS[upperCode];
    this.state.discount = Math.round(this.state.subtotal * discountRate);
    this.state.discountCode = upperCode;

    this.calculateTotals();
    this.saveToStorage();

    const message = `✅ Descuento ${Math.round(discountRate * 100)}% aplicado: -$${this.state.discount.toLocaleString('es-CL')}`;
    console.log(message);
    this.dispatchEvent(CART_EVENTS.COUPON_APPLIED, {
      code: upperCode,
      discountRate,
      discountAmount: this.state.discount,
    });

    return { success: true, message };
  }

  /**
   * Remover descuento
   */
  removeCoupon(): void {
    if (this.state.discount === 0) {
      return;
    }

    const oldDiscount = this.state.discount;
    this.state.discount = 0;
    this.state.discountCode = undefined;

    this.calculateTotals();
    this.saveToStorage();
    console.log(`❌ Cupón removido: reembolso de -$${oldDiscount.toLocaleString('es-CL')}`);
  }

  /**
   * Vaciar carrito
   */
  clear(): CartState {
    console.log('🗑️ Carrito vaciado');
    this.state = this.getEmptyCart();
    this.saveToStorage();
    this.dispatchEvent(CART_EVENTS.CLEARED, null);
    return this.state;
  }

  /**
   * Obtener cantidad total de items
   */
  getItemCount(): number {
    return this.state.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Obtener cantidad de un producto específico
   */
  getQuantity(productId: string): number {
    const item = this.state.items.find((i) => i.productId === productId);
    return item?.quantity || 0;
  }

  /**
   * Verificar si producto está en carrito
   */
  hasProduct(productId: string): boolean {
    return this.state.items.some((i) => i.productId === productId);
  }

  /**
   * Obtener cupones válidos (para mostrar en UI)
   */
  getValidCoupons(): string[] {
    return Object.keys(VALID_COUPONS);
  }
}

// ============== SINGLETON ==============
export const cartManager = new CartManager();

// ============== HOOK PARA ASTRO (SSR-safe) ==============
export function initializeCart(): CartState {
  return cartManager.getState();
}

// ============== TIPOS PARA EXPORT ==============
export type { CartState, CartItem };
