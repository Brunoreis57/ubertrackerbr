import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Array de rotas protegidas que exigem autenticação
const ROTAS_PROTEGIDAS = [
  '/adicionar-corrida',
  '/relatorios',
  '/backup',
  '/configuracoes',
  '/perfil',
];

// Middleware executado em cada requisição
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verifica se a rota atual requer autenticação
  const rotaProtegida = ROTAS_PROTEGIDAS.some(
    (rota) => pathname.startsWith(rota)
  );
  
  // Se a rota não for protegida, permitir acesso
  if (!rotaProtegida) {
    return NextResponse.next();
  }
  
  // Verificar se o usuário está logado através do cookie de sessão
  const sessaoCookie = request.cookies.get('sessao_usuario');
  const estaLogado = !!sessaoCookie && sessaoCookie.value.length > 0;
  
  // Se não estiver logado, redirecionar para a página de login
  if (!estaLogado) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', encodeURIComponent(pathname));
    return NextResponse.redirect(url);
  }
  
  // Se estiver logado, permitir acesso à rota protegida
  return NextResponse.next();
}

// Configurar o matcher para executar o middleware apenas nas rotas relevantes
export const config = {
  matcher: [
    /*
     * Match todas as rotas exceto:
     * 1. /api (rotas de API)
     * 2. /_next (arquivos Next.js)
     * 3. /_vercel (arquivos do Vercel)
     * 4. /favicon.ico, /site.webmanifest, etc.
     */
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}; 