import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiBox, FiPlus, FiMinus, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import { productAPI, cartAPI } from '../utils/api';
import { useCart } from '../context/CartContext';

const COMPONENTS = [
  {
    category: 'Sustenance (Food & Water)',
    items: [
      { id: 'c1', name: '72-Hour Survival Rations', price: 1499, icon: '🥫' },
      { id: 'c2', name: 'Emergency Water Pouches (12-pk)', price: 499, icon: '💧' },
      { id: 'c3', name: 'LifeStraw Personal Filter', price: 1299, icon: '🚰' }
    ]
  },
  {
    category: 'Medical Supplies',
    items: [
      { id: 'c4', name: 'Basic First Aid Kit (40-pc)', price: 799, icon: '🩹' },
      { id: 'c5', name: 'Trauma & Tourniquet Pack', price: 2499, icon: '🚨' },
      { id: 'c6', name: 'Burn Gel & Dressings', price: 399, icon: '🔥' }
    ]
  },
  {
    category: 'Tools & Safety',
    items: [
      { id: 'c7', name: 'Hand-Crank Weather Radio', price: 1899, icon: '📻' },
      { id: 'c8', name: 'LED Tactical Flashlight', price: 899, icon: '🔦' },
      { id: 'c9', name: 'Multi-Tool Survival Knife', price: 1299, icon: '🔪' },
      { id: 'c10', name: 'Thermal Blankets (4-pk)', price: 499, icon: '⛺' }
    ]
  }
];

export default function BuildKitPage() {
  const [customKitProduct, setCustomKitProduct] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { fetchCart } = useCart();

  useEffect(() => {
    // Fetch the virtual product ID for the Custom Kit
    productAPI.getAll({ limit: 100 })
      .then(res => {
        const vp = res.data.products.find(p => p.sku === 'PULL-SCM-CUSTOM');
        if (vp) setCustomKitProduct(vp);
      })
      .catch(console.error);
  }, []);

  const handleToggle = (item) => {
    setSelectedItems(prev => {
      const next = { ...prev };
      if (next[item.id]) {
        delete next[item.id];
      } else {
        next[item.id] = item;
      }
      return next;
    });
  };

  const selectedArray = Object.values(selectedItems);
  const componentsPrice = selectedArray.reduce((acc, item) => acc + item.price, 0);
  const baseBoxPrice = customKitProduct ? customKitProduct.price : 999;
  const totalPrice = baseBoxPrice + componentsPrice;

  const handleAddToCart = async () => {
    if (!customKitProduct) {
      setError('Custom Kit builder is currently unavailable. Please try again later.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await cartAPI.add({
        productId: customKitProduct._id,
        quantity: 1,
        customComponents: selectedArray.map(i => i.name),
        customPrice: totalPrice
      });
      await fetchCart();
      navigate('/cart');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add custom kit to cart');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '60px' }}>
      {/* Hero */}
      <section style={{ background: '#0f172a', color: '#fff', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ background: '#6366f1', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', display: 'inline-block', marginBottom: '20px', letterSpacing: '1px' }}>
          PULL SCM DEMONSTRATION
        </div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: '800', marginBottom: '12px' }}>
          Build Your <span style={{ color: '#818cf8' }}>Custom Kit</span>
        </h1>
        <p style={{ color: '#94a3b8', maxWidth: '640px', margin: '0 auto 28px', fontSize: '16px', lineHeight: '1.6' }}>
          Instead of restricting you to pre-assembled boxes, LIFESHIELD's dynamic supply chain allows you to order exactly what you need. Assemble your bespoke kit below, and our warehouse will pack it on-demand.
        </p>
      </section>

      <div style={{ maxWidth: '1200px', margin: '-40px auto 0', padding: '0 24px', display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* Left Side: Builder */}
        <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '16px', borderRadius: '12px', fontWeight: '600' }}>{error}</div>}
          
          {COMPONENTS.map((cat, categoryIndex) => (
            <div key={categoryIndex} style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,.04)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid #f1f5f9' }}>
                {cat.category}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {cat.items.map(item => {
                  const isSelected = !!selectedItems[item.id];
                  return (
                    <div 
                      key={item.id}
                      onClick={() => handleToggle(item)}
                      style={{ 
                        border: isSelected ? '2px solid #6366f1' : '2px solid #e2e8f0',
                        background: isSelected ? '#eef2ff' : '#fff',
                        borderRadius: '12px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative'
                      }}
                    >
                      <div style={{ position: 'absolute', top: '12px', right: '12px', color: isSelected ? '#6366f1' : '#cbd5e1' }}>
                        {isSelected ? <FiCheckCircle size={20} /> : <FiPlus size={20} />}
                      </div>
                      <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
                      <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px', marginBottom: '4px' }}>{item.name}</div>
                      <div style={{ color: '#6366f1', fontWeight: '800', fontSize: '15px', marginTop: 'auto' }}>Rs. {item.price}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Cart Summary */}
        <div style={{ flex: '0 0 350px', background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,.08)', position: 'sticky', top: '100px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiBox color="#6366f1" /> Your Custom Kit
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🧰</span>
                <span style={{ fontWeight: '600', color: '#334155', fontSize: '14px' }}>Heavy-Duty Vault</span>
              </div>
              <span style={{ fontWeight: '700', color: '#0f172a' }}>Rs. {baseBoxPrice}</span>
            </div>
            
            {selectedArray.map(item => (
              <div key={`summary-${item.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  <span style={{ fontWeight: '500', color: '#64748b', fontSize: '13px' }}>{item.name}</span>
                </div>
                <span style={{ fontWeight: '600', color: '#475569', fontSize: '14px' }}>Rs. {item.price}</span>
              </div>
            ))}
            
            {selectedArray.length === 0 && (
              <div style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic', padding: '12px 0' }}>
                Select components from the left to begin building your kit.
              </div>
            )}
          </div>
          
          <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '16px' }}>Total Price</span>
              <span style={{ fontWeight: '800', color: '#6366f1', fontSize: '24px' }}>Rs. {totalPrice}</span>
            </div>
          </div>
          
          <button 
            onClick={handleAddToCart} 
            disabled={loading || !customKitProduct}
            style={{ 
              width: '100%', 
              background: loading || !customKitProduct ? '#94a3b8' : '#0f172a', 
              color: '#fff', 
              border: 'none', 
              padding: '16px', 
              borderRadius: '12px', 
              fontWeight: '700', 
              fontSize: '16px', 
              cursor: loading || !customKitProduct ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Processing...' : (
              <>
                <FiShoppingCart /> Add Kit to Cart
              </>
            )}
          </button>
          
          <div style={{ marginTop: '16px', fontSize: '12px', color: '#64748b', textAlign: 'center', lineHeight: '1.5' }}>
            <strong>Made-to-Order:</strong> This bespoke kit uses Pull SCM routing and will bypass standard stock validation.
          </div>
        </div>
      </div>
    </div>
  );
}
