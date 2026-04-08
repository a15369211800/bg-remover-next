'use client';

import { useState, useEffect } from 'react';

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

export function AuthButton() {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user
    const stored = localStorage.getItem('bgRemoverUser');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    // Google OAuth popup
    const clientId = '648574251521-k3ini965gl068ck2c8a9ldbvggad6nkk.apps.googleusercontent.com';
    const redirectUri = `${window.location.origin}/auth/callback/`;
    const scope = 'email profile';
    const responseType = 'token';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=${responseType}`;
    
    window.location.href = authUrl;
  };

  const handleLogout = () => {
    localStorage.removeItem('bgRemoverUser');
    setUser(null);
  };

  if (loading) {
    return <div className="text-sm text-gray-600">...</div>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600 max-w-[100px] truncate">
          {user.name || user.email}
        </span>
        <button
          onClick={handleLogout}
          className="px-3 py-1 text-xs text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
        >
          退出
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="px-3 py-1 text-xs text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full hover:shadow-lg transition-all"
    >
      Google 登录
    </button>
  );
}
