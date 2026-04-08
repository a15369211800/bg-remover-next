'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { AuthButton } from '@/components/AuthButton';

const API_KEY = '9e37wbtVkZrt1DqiJxTU4333';
const TIMEOUT_MS = 30000;
const DAILY_FREE_QUOTA = 2;

const i18n = {
  en: {
    title: 'AI Background Remover',
    subtitle: 'Free · No signup · Instant results',
    uploadMain: 'Click to upload or drag & drop',
    uploadHint: 'PNG · JPG · WEBP · Max 10 MB',
    loadingText: 'Removing background…',
    labelOriginal: 'Original',
    labelResult: 'Background Removed ✅',
    downloadText: 'Download PNG',
    newText: 'Try Another Image',
    langBtn: '中文',
    errSize: 'File too large. Please upload an image under 10 MB.',
    errType: 'Unsupported file type. Please use PNG, JPG, or WEBP.',
    errTimeout: 'Request timed out (30s). Please check your connection and try again.',
    errQuota: 'Free quota exceeded. Please try again tomorrow.',
    errInvalid: 'Invalid image. Please try a different file.',
    errRate: 'Too many requests. Please wait a moment and try again.',
    errGeneric: 'Something went wrong. Please try again.',
    quotaText: 'Removals left: ',
    upgradeTitle: 'No removals left',
    upgradeDesc: 'Upgrade to continue removing backgrounds',
    upgradeBtn: 'View Plans',
  },
  zh: {
    title: 'AI 智能抠图',
    subtitle: '免费 · 无需注册 · 即时出图',
    uploadMain: '点击上传或拖拽图片至此',
    uploadHint: '支持 PNG · JPG · WEBP · 最大 10 MB',
    loadingText: '正在去除背景，请稍候…',
    labelOriginal: '原图',
    labelResult: '已去除背景 ✅',
    downloadText: '下载 PNG',
    newText: '处理另一张图',
    langBtn: 'English',
    errSize: '文件过大，请上传 10 MB 以内的图片。',
    errType: '不支持的文件格式，请使用 PNG、JPG 或 WEBP。',
    errTimeout: '请求超时（30秒），请检查网络后重试。',
    errQuota: '今日免费额度已用完，请明天再试。',
    errInvalid: '图片无效，请换一张图片试试。',
    errRate: '请求过于频繁，请稍后再试。',
    errGeneric: '出现错误，请重试。',
    quotaText: '剩余次数：',
    upgradeTitle: '次数已用完',
    upgradeDesc: '升级会员继续去除背景',
    upgradeBtn: '查看套餐',
  }
};

export default function Home() {
  const [lang, setLang] = useState<'en' | 'zh'>('en');
  const [quota, setQuota] = useState(DAILY_FREE_QUOTA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = i18n[lang];

  // Quota helpers
  const getQuotaKey = useCallback(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `bgRemoverQuota_${y}-${m}-${d}`;
  }, []);

  const getTodayQuota = useCallback(() => {
    if (typeof window === 'undefined') return DAILY_FREE_QUOTA;
    const stored = localStorage.getItem(getQuotaKey());
    return stored !== null ? parseInt(stored, 10) : DAILY_FREE_QUOTA;
  }, [getQuotaKey]);

  const updateQuotaDisplay = useCallback(() => {
    setQuota(getTodayQuota());
  }, [getTodayQuota]);

  useEffect(() => {
    updateQuotaDisplay();
  }, [updateQuotaDisplay]);

  const consumeQuota = useCallback(() => {
    const current = getTodayQuota();
    if (current <= 0) return false;
    localStorage.setItem(getQuotaKey(), (current - 1).toString());
    updateQuotaDisplay();
    return true;
  }, [getQuotaKey, getTodayQuota, updateQuotaDisplay]);

  // Language toggle
  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'zh' : 'en');
  };

  // Error handling
  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  // Process image
  const processImage = async (file: File) => {
    // Validate
    if (file.size > 10 * 1024 * 1024) {
      showError(t.errSize);
      return;
    }
    if (!file.type.startsWith('image/')) {
      showError(t.errType);
      return;
    }

    // Check quota
    if (!consumeQuota()) {
      showError(t.errQuota);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Show original image
      const originalUrl = URL.createObjectURL(file);
      setOriginalImage(originalUrl);

      // Call API
      const formData = new FormData();
      formData.append('image_file', file);
      formData.append('size', 'auto');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': API_KEY,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) throw new Error(t.errRate);
        if (response.status === 400) throw new Error(t.errInvalid);
        throw new Error(t.errGeneric);
      }

      const blob = await response.blob();
      setResultBlob(blob);
      setResultImage(URL.createObjectURL(blob));
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          showError(t.errTimeout);
        } else {
          showError(err.message);
        }
      } else {
        showError(t.errGeneric);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Upload handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    } else {
      showError(t.errType);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (quota <= 0) {
      window.location.href = '/pricing';
      return;
    }
    fileInputRef.current?.click();
  };

  // Download
  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'background-removed.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Reset
  const handleReset = () => {
    setOriginalImage(null);
    setResultImage(null);
    setResultBlob(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Quota status styles
  const getQuotaClass = () => {
    if (quota >= DAILY_FREE_QUOTA) return 'from-green-500/20 to-green-600/20 border-green-500/40';
    if (quota > 0) return 'from-amber-500/20 to-amber-600/20 border-amber-500/40';
    return 'from-red-500/20 to-red-600/20 border-red-500/40';
  };

  const getQuotaTextClass = () => {
    if (quota >= DAILY_FREE_QUOTA) return 'text-green-600';
    if (quota > 0) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl p-8 md:p-10 w-full max-w-xl shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="border-2 border-gray-200 rounded-full px-4 py-1 text-sm text-gray-600 hover:border-[#667eea] hover:text-[#667eea] transition-colors"
            >
              {t.langBtn}
            </button>
            <AuthButton />
          </div>
          <Link
            href="/pricing"
            className="text-sm text-[#667eea] border border-[#667eea] rounded-full px-3 py-1 hover:bg-[#667eea] hover:text-white transition-colors"
          >
            ⚡ Upgrade
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-center text-gray-900 text-2xl mb-1 font-semibold">{t.title}</h1>
        <p className="text-center text-gray-500 text-sm mb-5">{t.subtitle}</p>

        {/* Quota Display */}
        <div className={`text-center bg-gradient-to-r ${getQuotaClass()} rounded-xl p-3 mb-5 border-2`}>
          <span className="text-gray-800 font-medium">{t.quotaText}</span>
          <span className={`text-lg font-bold ${getQuotaTextClass()}`}>{quota}</span>
        </div>

        {/* Upgrade Banner */}
        {quota <= 0 && (
          <div className="text-center bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-xl p-5 mb-5 text-white">
            <h3 className="text-lg font-semibold mb-2">{t.upgradeTitle}</h3>
            <p className="text-sm opacity-90 mb-3">{t.upgradeDesc}</p>
            <Link
              href="/pricing"
              className="inline-block bg-white text-[#667eea] px-6 py-2 rounded-full font-semibold text-sm hover:scale-105 transition-transform"
            >
              {t.upgradeBtn}
            </Link>
          </div>
        )}

        {/* Upload Area */}
        {!originalImage && (
          <div
            onClick={handleClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-3 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
              quota <= 0
                ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                : isDragging
                ? 'border-[#764ba2] bg-indigo-50'
                : 'border-[#667eea] bg-indigo-50/50 hover:bg-indigo-50 hover:border-[#764ba2]'
            }`}
          >
            <div className="text-4xl mb-2">🖼️</div>
            <p className="text-gray-800 mb-1">
              <strong className="text-[#667eea]">Click to upload</strong> or drag & drop
            </p>
            <p className="text-gray-400 text-sm">{t.uploadHint}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-7">
            <div className="w-10 h-10 border-4 border-gray-100 border-t-[#667eea] rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600 text-sm">{t.loadingText}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 border-l-4 border-red-500 rounded-lg p-3 mt-4 text-sm">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Result */}
        {originalImage && !isLoading && (
          <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {/* Original */}
              <div className="border-2 border-gray-100 rounded-lg overflow-hidden">
                <img
                  src={originalImage}
                  alt="Original"
                  className="w-full h-44 object-contain bg-[conic-gradient(#ddd_0%_25%,#fff_0%_50%)_0_0/14px_14px]"
                />
                <div className="text-center py-1.5 bg-gray-50 text-xs text-gray-500 font-semibold border-t border-gray-100">
                  {t.labelOriginal}
                </div>
              </div>

              {/* Result */}
              <div className="border-2 border-gray-100 rounded-lg overflow-hidden">
                {resultImage ? (
                  <>
                    <img
                      src={resultImage}
                      alt="Result"
                      className="w-full h-44 object-contain bg-[conic-gradient(#ddd_0%_25%,#fff_0%_50%)_0_0/14px_14px]"
                    />
                    <div className="text-center py-1.5 bg-gray-50 text-xs text-gray-500 font-semibold border-t border-gray-100">
                      {t.labelResult}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-44 flex items-center justify-center bg-gray-50">
                    <span className="text-gray-400 text-sm">Processing...</span>
                  </div>
                )}
              </div>
            </div>

            {resultImage && (
              <>
                <button
                  onClick={handleDownload}
                  className="w-full py-3.5 rounded-full font-semibold text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:-translate-y-0.5 transition-transform mb-2"
                >
                  ⬇️ {t.downloadText}
                </button>
                <button
                  onClick={handleReset}
                  className="w-full py-3.5 rounded-full font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  🔄 {t.newText}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
