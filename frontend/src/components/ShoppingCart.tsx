/**
 * ShoppingCart.tsx
 * Componente React: Sidebar modal del carrito
 * Integración: <ShoppingCart client:only="react" />
 *
 * Features:
 * - Sidebar animado con overlay
 * - Listado de items con imágenes
 * - Control de cantidad (+/-)
 * - Resumen de precios automático
 * - Aplicación de cupones
 * - Botón "Ir a Pagar"
 */

import React, { useState, useEffect } from 'react';
import { cartManager, CART_EVENTS, type CartState } from '@/store/cart';
import './ShoppingCart.css';

export default function ShoppingCart() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartState, setCartState] = useState<CartState>(cartManager.getState());
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [couponError, setCouponError] = useState(false);

  // Listeners de eventos del carrito
  useEffect(() => {
    // Actualizar estado cuando cambie el carrito
    const handleCartUpdate = () => {
      setCartState(cartManager.getState());
    };

    // Mostrar mensajes de cupón
    const handleCouponApplied = (e: any) => {
      setCouponMessage(`✅ Descuento ${Math.round(e.detail.discountRate * 100)}% aplicado`);
      setCouponError(false);
      setCouponInput('');
      setTimeout(() => setCouponMessage(''), 3000);
    };

    window.addEventListener(CART_EVENTS.UPDATED, handleCartUpdate);
    window.addEventListener(CART_EVENTS.COUPON_APPLIED, handleCouponApplied);

    return () => {
      window.removeEventListener(CART_EVENTS.UPDATED, handleCartUpdate);
      window.removeEventListener(CART_EVENTS.COUPON_APPLIED, handleCouponApplied);
    };
  }, []);

  const handleRemoveItem = (productId: string) => {
    cartManager.remove(productId);
    setCartState(cartManager.getState());
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
    } else {
      cartManager.updateQuantity(productId, newQuantity);
      setCartState(cartManager.getState());
    }
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) {
      setCouponError(true);
      setCouponMessage('⚠️ Ingresa un código de descuento');
      return;
    }

    const result = cartManager.applyCoupon(couponInput);
    if (result.success) {
      setCouponError(false);
      setCouponMessage(result.message);
      setCouponInput('');
      setCartState(cartManager.getState());
      setTimeout(() => setCouponMessage(''), 3000);
    } else {
      setCouponError(true);
      setCouponMessage(result.message);
    }
  };

  const handleClearCart = () => {
    if (confirm('¿Deseas vaciar el carrito?')) {
      cartManager.clear();
      setCartState(cartManager.getState());
    }
  };

  const itemCount = cartManager.getItemCount();
  const isEmpty = cartState.items.length === 0;

  return (
    <>
      {/* Botón flotante del carrito */}
      <button
        className="cart-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir carrito"
        title={`Carrito (${itemCount} items)`}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div
          className="cart-overlay"
          onClick={() => setIsOpen(false)}
          role="presentation"
        />
      )}

      {/* Sidebar del carrito */}
      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="cart-header">
          <h2>Mi Carrito</h2>
          <button
            className="cart-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar carrito"
          >
            ✕
          </button>
        </div>

        {isEmpty ? (
          // Estado vacío
          <div className="cart-empty">
            <div className="empty-icon">🛒</div>
            <h3>Tu carrito está vacío</h3>
            <p>Explora nuestros productos y agrega los que te interesen</p>
            <a
              href="/productos"
              className="btn-back"
              onClick={() => setIsOpen(false)}
            >
              ← Volver al catálogo
            </a>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="cart-items">
              {cartState.items.map((item) => (
                <div key={item.productId} className="cart-item">
                  {/* Imagen */}
                  {item.mainImage && (
                    <div className="item-image">
                      <img
                        src={item.mainImage}
                        alt={item.productName}
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="item-content">
                    <h4 className="item-name">{item.productName}</h4>
                    <p className="item-price">
                      ${item.priceAtTime.toLocaleString('es-CL')}
                    </p>

                    {/* Quantity Control */}
                    <div className="quantity-control">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.productId, item.quantity - 1)
                        }
                        className="qty-btn"
                        aria-label="Restar cantidad"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateQuantity(
                            item.productId,
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="qty-input"
                      />
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.productId, item.quantity + 1)
                        }
                        className="qty-btn"
                        aria-label="Sumar cantidad"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Subtotal y remover */}
                  <div className="item-actions">
                    <div className="subtotal">
                      ${(item.priceAtTime * item.quantity).toLocaleString('es-CL')}
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="btn-remove"
                      title="Remover del carrito"
                      aria-label="Remover"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cupón */}
            <div className="coupon-section">
              <label htmlFor="coupon-input">Código de descuento</label>
              <div className="coupon-input-group">
                <input
                  id="coupon-input"
                  type="text"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value.toUpperCase());
                    setCouponMessage('');
                  }}
                  placeholder="Ej: DESCUENTO10"
                  className="coupon-input"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="coupon-btn"
                  disabled={!couponInput.trim()}
                >
                  Aplicar
                </button>
              </div>
              {cartState.discountCode && (
                <button
                  onClick={() => {
                    cartManager.removeCoupon();
                    setCartState(cartManager.getState());
                  }}
                  className="coupon-remove"
                >
                  ❌ Remover cupón
                </button>
              )}
              {couponMessage && (
                <p className={`coupon-message ${couponError ? 'error' : 'success'}`}>
                  {couponMessage}
                </p>
              )}
            </div>

            {/* Resumen */}
            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${cartState.subtotal.toLocaleString('es-CL')}</span>
              </div>

              {cartState.shippingCost > 0 && (
                <div className="summary-row">
                  <span>Envío</span>
                  <span>${cartState.shippingCost.toLocaleString('es-CL')}</span>
                </div>
              )}

              {cartState.shippingCost === 0 && cartState.subtotal > 0 && (
                <div className="summary-row free-shipping">
                  <span>🎉 Envío gratis</span>
                  <span>-$5,000</span>
                </div>
              )}

              {cartState.discount > 0 && (
                <div className="summary-row discount">
                  <span>Descuento ({cartState.discountCode})</span>
                  <span>-${cartState.discount.toLocaleString('es-CL')}</span>
                </div>
              )}

              <div className="summary-row total">
                <span>Total</span>
                <span>${cartState.total.toLocaleString('es-CL')}</span>
              </div>
            </div>

            {/* Botones */}
            <div className="cart-actions">
              <a
                href="/checkout"
                className="btn btn-primary"
                onClick={() => setIsOpen(false)}
              >
                Proceder al pago
              </a>
              <button
                onClick={handleClearCart}
                className="btn btn-secondary"
              >
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
