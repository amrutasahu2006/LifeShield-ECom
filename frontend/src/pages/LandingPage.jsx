import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productAPI } from '../utils/api';
import { FiCheckCircle, FiShield, FiTruck, FiStar } from 'react-icons/fi';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 14, seconds: 59 });
  const [promoProduct, setPromoProduct] = useState(null);

  useEffect(() => {
    document.title = "72-Hour Survival Kit | LIFESHIELD Flash Sale"
    // Search the MongoDB payload for the exact matching 72-Hour Survival Kit (DPK-001)
    productAPI.getAll().then(r => {
      if (r.data && r.data.products) {
        const targetKit = r.data.products.find(p => p.sku === 'DPK-001') || r.data.products[0];
        setPromoProduct(targetKit);
      }
    }).catch(err => console.log('Promo load error', err));

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClaimOffer = async () => {
    if (!user) {
      alert("Please login to claim this flash sale!");
      navigate('/login');
      return;
    }
    if (promoProduct) {
      await addToCart(promoProduct._id, 1);
    }
    navigate('/checkout'); // Push straight into checkout funnel
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Intense Urgency Banner */}
      <div style={{ background: '#000', color: '#fff', textAlign: 'center', padding: '10px 16px', fontSize: '13px', fontWeight: 'bold' }}>
        ⚠️ EMERGENCY FLASH SALE: 50% OFF THE 72-HOUR SURVIVAL KIT. 
        <span style={{ color: '#ef4444', marginLeft: '8px' }}>
          OFFER EXPIRES IN {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>

      {/* Main Squeeze Hero */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', alignItems: 'center' }}>
        {/* Product Visual */}
        <div style={{ position: 'relative', maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#ef4444', color: '#fff', padding: '10px 14px', borderRadius: '50%', fontWeight: '900', fontSize: '16px', transform: 'rotate(15deg)', boxShadow: '0 8px 15px rgba(239, 68, 68, 0.4)' }}>
            SAVE<br/>50%
          </div>
          <img src="https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600" alt="Survival Kit" style={{ width: '100%', borderRadius: '16px', boxShadow: '0 15px 30px -12px rgba(0, 0, 0, 0.25)' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', padding: '0 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', fontWeight: 'bold' }}><FiTruck color="#10b981" size={16}/> Free Shipping Today</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', fontWeight: 'bold' }}><FiShield color="#3b82f6" size={16}/> 5-Year Warranty</div>
          </div>
        </div>

        {/* Sales Copy */}
        <div>
          <div style={{ display: 'flex', gap: '2px', color: '#eab308', marginBottom: '8px' }}>
            <FiStar fill="#eab308" size={14} /><FiStar fill="#eab308" size={14} /><FiStar fill="#eab308" size={14} /><FiStar fill="#eab308" size={14} /><FiStar fill="#eab308" size={14} />
            <span style={{ color: '#64748b', fontWeight: 'bold', marginLeft: '6px', fontSize: '13px' }}>4.9/5 (10,412 Reviews)</span>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', lineHeight: '1.2', marginBottom: '16px', letterSpacing: '-0.5px' }}>
            The 72-Hour Emergency Survival Kit (4 Person).
          </h1>
          <p style={{ fontSize: '15px', color: '#475569', marginBottom: '24px', lineHeight: '1.5' }}>
            When disaster strikes, you won't have time to pack. Secure your family's safety with the ultimate 72-hour survival kit, packed with military-grade medical supplies, emergency rations, and critical shelter tools.
          </p>

          <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#94a3b8', textDecoration: 'line-through' }}>Rs. 24,998.00</span>
              <span style={{ fontSize: '28px', fontWeight: '900', color: '#dc2626' }}>Rs. 12,499.00</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                '4-Day Sustainment Rations (4 Person)',
                '142-Piece Trauma Medical Supply Build',
                'Hand-crank radio, flashlight, dust masks',
                'Water filtration & Thermal Blankets'
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>
                  <FiCheckCircle color="#10b981" size={16} /> {item}
                </li>
              ))}
            </ul>
          </div>

          <button 
            onClick={handleClaimOffer}
            style={{ width: '100%', background: 'linear-gradient(to right, #ef4444, #dc2626)', color: '#fff', fontSize: '18px', fontWeight: '800', padding: '16px', borderRadius: '10px', border: 'none', cursor: 'pointer', boxShadow: '0 8px 15px -4px rgba(239, 68, 68, 0.4)', textTransform: 'uppercase', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Claim 50% Off & Checkout Now →
          </button>
          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
            🔒 Secure 256-bit Encryption Checkout
          </div>
        </div>
      </div>

      {/* Social Proof Strip */}
      <div style={{ background: '#0f172a', padding: '30px 20px', color: '#f8fafc', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>What Prepared Families Are Saying</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', maxWidth: '900px', margin: '0 auto' }}>
          {[
            { name: "Sarah M.", text: "Arrived the next day. The medical kit is incredibly high quality. I feel so much safer having this in my closet." },
            { name: "David K.", text: "As a former EMT, I was impressed by the trauma supplies included. You can't put a price on this level of readiness." },
            { name: "Elena R.", text: "Caught the flash sale. Amazing value. Hopefully I never have to use it, but it's the best insurance policy I've ever bought." }
          ].map((review, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', flex: '1 1 220px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', gap: '2px', color: '#eab308', marginBottom: '10px' }}>
                <FiStar fill="#eab308" size={12} /><FiStar fill="#eab308" size={12} /><FiStar fill="#eab308" size={12} /><FiStar fill="#eab308" size={12} /><FiStar fill="#eab308" size={12} />
              </div>
              <p style={{ fontSize: '13px', lineHeight: '1.5', marginBottom: '12px', fontStyle: 'italic', color: '#cbd5e1' }}>"{review.text}"</p>
              <div style={{ fontWeight: '700', fontSize: '13px' }}>— {review.name} <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '11px', marginLeft: '6px' }}>✓ Verified</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
