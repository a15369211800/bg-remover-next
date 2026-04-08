'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style: { layout: string; color: string; shape: string; label: string; height: number };
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onError: () => void;
      }) => { render: (selector: string) => void };
    };
  }
}

const API_BASE = 'https://api.background-remover.website';

export default function Pricing() {
  const addCredits = (credits: number) => {
    const today = new Date();
    const key = `bgRemoverQuota_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const current = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, (current + credits).toString());
  };

  const showToast = (msg: string) => {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = msg;
      toast.classList.add('active');
      toast.style.display = 'block';
      setTimeout(() => {
        toast.classList.remove('active');
        toast.style.display = 'none';
      }, 4000);
    }
  };

  const renderPayPalButtons = useCallback(() => {
    if (!window.paypal) return;

    // Single pack
    window.paypal.Buttons({
      style: { layout: 'vertical', color: 'blue', shape: 'pill', label: 'pay', height: 40 },
      createOrder: async () => {
        const res = await fetch(`${API_BASE}/api/orders/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: 'pack_1' }),
        });
        const data = await res.json() as { id: string };
        return data.id;
      },
      onApprove: async (data) => {
        const res = await fetch(`${API_BASE}/api/orders/capture`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderID: data.orderID, plan: 'pack_1' }),
        });
        const result = await res.json() as { success: boolean; credits: number };
        if (result.success) {
          addCredits(result.credits);
          showToast(`✅ Payment successful! ${result.credits} credit(s) added.`);
          setTimeout(() => window.location.href = '/', 2000);
        }
      },
      onError: () => {
        showToast('❌ Payment failed. Please try again.');
      },
    }).render('#paypal-pack1');

    // Starter pack
    window.paypal.Buttons({
      style: { layout: 'vertical', color: 'blue', shape: 'pill', label: 'pay', height: 40 },
      createOrder: async () => {
        const res = await fetch(`${API_BASE}/api/orders/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: 'pack_10' }),
        });
        const data = await res.json() as { id: string };
        return data.id;
      },
      onApprove: async (data) => {
        const res = await fetch(`${API_BASE}/api/orders/capture`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderID: data.orderID, plan: 'pack_10' }),
        });
        const result = await res.json() as { success: boolean; credits: number };
        if (result.success) {
          addCredits(result.credits);
          showToast(`✅ Payment successful! ${result.credits} credits added.`);
          setTimeout(() => window.location.href = '/', 2000);
        }
      },
      onError: () => {
        showToast('❌ Payment failed. Please try again.');
      },
    }).render('#paypal-pack10');
  }, []);

  useEffect(() => {
    // Load PayPal SDK
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=AQbPdlCyEG26tRlY04NJXVS0r4Gva9-LnE6JriuHMnedbLH1jBTDybaweIC2BO0OUWglyg4OQDts62YH&intent=capture&currency=USD&components=buttons`;
    script.async = true;
    script.onload = () => {
      renderPayPalButtons();
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [renderPayPalButtons]);

  const handleSubscribe = async (plan: string, credits: number, btnId: string) => {
    const btn = document.getElementById(btnId) as HTMLButtonElement;
    if (!btn) return;
    
    btn.disabled = true;
    btn.textContent = 'Redirecting to PayPal...';
    
    try {
      const res = await fetch(`${API_BASE}/api/subscriptions/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const result = await res.json() as { success: boolean; credits?: number; approveUrl?: string; error?: string };
      if (result.approveUrl) {
        window.location.href = result.approveUrl;
      } else {
        throw new Error(result.error || 'No approval URL');
      }
    } catch {
      showToast('❌ Subscription failed. Please try again.');
      btn.disabled = false;
      btn.textContent = 'Subscribe with PayPal';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Back Link */}
        <Link href="/" className="inline-block text-white/80 text-sm mb-6 hover:text-white transition-colors">
          ← Back
        </Link>

        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-white text-3xl font-bold mb-2">Unlock More Removals</h1>
          <p className="text-white/75">Simple plans, cancel anytime</p>
        </div>
        <p className="text-center text-white/55 text-sm mb-8">Free plan: 2 removals / day</p>

        {/* Monthly Subscription */}
        <p className="text-white/85 text-xs font-bold uppercase tracking-wider mb-3.5 pl-1">Monthly Subscription</p>
        <div className="grid md:grid-cols-2 gap-4 mb-7">
          {/* Member */}
          <div className="bg-white rounded-2xl p-7 text-center">
            <div className="text-lg font-bold text-gray-900 mb-1">Member</div>
            <div className="text-xs text-gray-400 mb-4">For regular use</div>
            <div className="text-4xl font-extrabold text-[#667eea] leading-none mb-1">
              <sup className="text-lg font-semibold align-top mt-1.5">$</sup>7.9
              <sub className="text-sm font-normal text-gray-400">/mo</sub>
            </div>
            <div className="inline-block bg-indigo-50 text-[#667eea] text-xs font-semibold px-3 py-1 rounded-full my-3">
              100 removals / month
            </div>
            <ul className="text-left text-sm text-gray-600 mb-5 space-y-1.5">
              <li className="flex items-center gap-2"><span className="text-[#667eea] font-bold">✓</span> 100 HD removals / month</li>
              <li className="flex items-center gap-2"><span className="text-[#667eea] font-bold">✓</span> No watermark</li>
              <li className="flex items-center gap-2"><span className="text-[#667eea] font-bold">✓</span> PNG transparent output</li>
              <li className="flex items-center gap-2"><span className="text-[#667eea] font-bold">✓</span> Email support</li>
            </ul>
            <button
              id="btn-member"
              onClick={() => handleSubscribe('member_monthly', 100, 'btn-member')}
              className="w-full py-3 bg-[#0070ba] text-white rounded-full font-semibold hover:bg-[#005ea6] hover:-translate-y-0.5 transition-all disabled:bg-gray-400 disabled:cursor-wait"
            >
              Subscribe with PayPal
            </button>
          </div>

          {/* Super Member */}
          <div className="bg-white rounded-2xl p-7 text-center relative border-[3px] border-[#667eea]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
              Best Value
            </div>
            <div className="text-lg font-bold text-gray-900 mb-1">Super Member</div>
            <div className="text-xs text-gray-400 mb-4">For power users</div>
            <div className="text-4xl font-extrabold text-[#667eea] leading-none mb-1">
              <sup className="text-lg font-semibold align-top mt-1.5">$</sup>19.9
              <sub className="text-sm font-normal text-gray-400">/mo</sub>
            </div>
            <div className="inline-block bg-indigo-50 text-[#667eea] text-xs font-semibold px-3 py-1 rounded-full my-3">
              300 removals / month
            </div>
            <ul className="text-left text-sm text-gray-600 mb-5 space-y-1.5">
              <li className="flex items-center gap-2"><span className="text-[#667eea] font-bold">✓</span> 300 HD removals / month</li>
              <li className="flex items-center gap-2"><span className="text-[#667eea] font-bold">✓</span> No watermark</li>
              <li className="flex items-center gap-2"><span className="text-[#667eea] font-bold">✓</span> PNG transparent output</li>
              <li className="flex items-center gap-2"><span className="text-[#667eea] font-bold">✓</span> Priority processing</li>
              <li className="flex items-center gap-2"><span className="text-[#667eea] font-bold">✓</span> Priority support</li>
            </ul>
            <button
              id="btn-super"
              onClick={() => handleSubscribe('super_monthly', 300, 'btn-super')}
              className="w-full py-3 bg-[#0070ba] text-white rounded-full font-semibold hover:bg-[#005ea6] hover:-translate-y-0.5 transition-all disabled:bg-gray-400 disabled:cursor-wait"
            >
              Subscribe with PayPal
            </button>
          </div>
        </div>

        <hr className="border-white/20 mb-7" />

        {/* Pay Per Use */}
        <p className="text-white/85 text-xs font-bold uppercase tracking-wider mb-3.5 pl-1">Pay Per Use · No subscription</p>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Single */}
          <div className="bg-white rounded-2xl p-6 text-center flex flex-col justify-between">
            <div>
              <div className="text-lg font-bold text-gray-900 mb-0.5">Single</div>
              <div className="text-xs text-gray-400 mb-3">Just one removal</div>
              <div className="text-3xl font-extrabold text-[#667eea] leading-none mb-1">
                <sup className="text-lg font-semibold align-top">$</sup>0.59
              </div>
              <div className="inline-block bg-indigo-50 text-[#667eea] text-xs font-semibold px-3 py-1 rounded-full my-2">
                1 removal
              </div>
            </div>
            <div id="paypal-pack1" className="mt-2 min-h-[45px]" />
          </div>

          {/* Starter Pack */}
          <div className="bg-white rounded-2xl p-6 text-center relative flex flex-col justify-between border-[3px] border-[#667eea]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
              Popular
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 mb-0.5">Starter Pack</div>
              <div className="text-xs text-gray-400 mb-3">Best per-credit price</div>
              <div className="text-3xl font-extrabold text-[#667eea] leading-none mb-1">
                <sup className="text-lg font-semibold align-top">$</sup>1.99
              </div>
              <div className="inline-block bg-indigo-50 text-[#667eea] text-xs font-semibold px-3 py-1 rounded-full my-2">
                10 removals
              </div>
            </div>
            <div id="paypal-pack10" className="mt-2 min-h-[45px]" />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-white/50 text-xs">
          <p>
            Questions?{' '}
            <a href="mailto:support@background-remover.website" className="text-white/70 hover:text-white">
              support@background-remover.website
            </a>
          </p>
        </div>
      </div>

      {/* Toast */}
      <div
        id="toast"
        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-500 text-white px-7 py-3.5 rounded-full font-semibold shadow-xl z-50 hidden"
      />
    </main>
  );
}
