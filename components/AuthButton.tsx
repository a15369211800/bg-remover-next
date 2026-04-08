'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="text-sm text-gray-600">...</div>;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600 max-w-[100px] truncate">
          {session.user.name || session.user.email}
        </span>
        <button
          onClick={() => signOut()}
          className="px-3 py-1 text-xs text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
        >
          退出
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="px-3 py-1 text-xs text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full hover:shadow-lg transition-all"
    >
      Google 登录
    </button>
  );
}
