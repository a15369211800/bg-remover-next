'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Parse hash fragment for access token
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');

    if (accessToken) {
      // Fetch user info from Google
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
        .then(res => res.json())
        .then(user => {
          // Store user info
          localStorage.setItem('bgRemoverUser', JSON.stringify(user));
          // Redirect to home
          router.push('/');
        })
        .catch(err => {
          console.error('Auth error:', err);
          router.push('/');
        });
    } else {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-lg">登录中...请稍候</div>
      </div>
    </div>
  );
}
