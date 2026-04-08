# Google OAuth Setup Guide

## 1. 创建 Google OAuth 应用

访问 [Google Cloud Console](https://console.cloud.google.com/)

### 步骤:
1. 创建新项目或选择现有项目
2. 启用 Google+ API
3. 转到 "APIs & Services" > "Credentials"
4. 点击 "Create Credentials" > "OAuth client ID"
5. 选择 "Web application"
6. 配置:
   - **Authorized JavaScript origins**: 
     - `https://background-remover.website`
   - **Authorized redirect URIs**: 
     - `https://background-remover.website/api/auth/callback/google`

7. 获取 Client ID 和 Client Secret

## 2. 配置环境变量

编辑 `.env.local` 文件,填入:
```
NEXTAUTH_SECRET=<生成一个随机字符串>
GOOGLE_CLIENT_ID=<你的 Google Client ID>
GOOGLE_CLIENT_SECRET=<你的 Google Client Secret>
```

生成 NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## 3. 部署到 Cloudflare Pages

在 Cloudflare Pages 项目设置中添加环境变量:
- `NEXTAUTH_URL` = `https://background-remover.website`
- `NEXTAUTH_SECRET` = (同上)
- `GOOGLE_CLIENT_ID` = (同上)
- `GOOGLE_CLIENT_SECRET` = (同上)

## 4. 使用认证

在任何页面中导入并使用 AuthButton 组件:
```tsx
import { AuthButton } from '@/components/AuthButton';

// 在组件中使用
<AuthButton />
```

获取用户会话:
```tsx
import { useSession } from 'next-auth/react';

const { data: session } = useSession();
if (session) {
  console.log(session.user);
}
```
