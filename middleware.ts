import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 需要认证的路径
const protectedPaths = [
  '/tasks',
  '/thoughts',
  '/read-later',
  '/knowledge',
  '/manage',
];

// 不需要认证的路径
const publicPaths = [
  '/login',
  '/register',
  '/',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/health',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查是否是API路由
  const isApiRoute = pathname.startsWith('/api');

  // 检查是否是公开路径
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // 检查是否是受保护路径
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path)) ||
                         (isApiRoute && !isPublicPath);

  // 获取会话令牌
  const authToken = request.cookies.get('auth_token')?.value;

  // 如果是受保护路径但没有令牌，重定向到登录页面
  if (isProtectedPath && !authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 如果是登录/注册页面但已有令牌，重定向到首页
  if ((pathname === '/login' || pathname === '/register') && authToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了:
     * - 静态文件 (如 /favicon.ico, /images/*)
     * - 公开API路由 (如 /api/health)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|api/health).*)',
  ],
};
