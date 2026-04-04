'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const i18n = {
  en: {
    title: 'Payment Successful! 🎉',
    subtitle: 'Your credits have been added to your account.',
    cta: 'Start Removing Backgrounds',
    back: '← Back to Home',
  },
  zh: {
    title: '支付成功！🎉',
    subtitle: '额度已添加到您的账户。',
    cta: '开始去除背景',
    back: '← 返回首页',
  }
};

export default function Success() {
  const [lang, setLang] = useState<'en' | 'zh'>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('bgRemoverLang') as 'en' | 'zh';
    if (savedLang) setLang(savedLang);
  }, []);

  const t = i18n[lang];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl p-10 md:p-12 w-full max-w-md shadow-2xl text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-600 mb-8">{t.subtitle}</p>
        
        <Link
          href="/"
          className="inline-block w-full py-3.5 rounded-full font-semibold text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:-translate-y-0.5 transition-transform mb-3"
        >
          {t.cta}
        </Link>
        
        <Link
          href="/"
          className="inline-block text-[#667eea] hover:underline"
        >
          {t.back}
        </Link>
      </div>
    </main>
  );
}
