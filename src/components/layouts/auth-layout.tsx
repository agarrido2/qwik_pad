import { component$, Slot } from '@builder.io/qwik';

/**
 * AuthLayout - Para páginas de autenticación (login, register, reset password)
 * Layout centrado con fondo sutil
 */
export const AuthLayout = component$(() => {
  return (
    <div class="flex min-h-screen flex-col bg-gradient-to-br from-neutral-50 to-primary-50/30">
      {/* Logo fixe */}
      <div class="absolute left-8 top-8">
        <a href="/" class="text-2xl font-bold text-primary-600" aria-label="Onucall - Volver al inicio">
          Onucall
        </a>
      </div>

      {/* Main Content - Centrado */}
      <main class="flex flex-1 items-center justify-center px-4 py-12">
        <div class="w-full max-w-md">
          <Slot />
        </div>
      </main>

      {/* Footer discreto */}
      <footer class="pb-8 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} Onucall · 
        <a href="#" class="ml-1 hover:text-primary-600 transition-colors">Privacidad</a> · 
        <a href="#" class="ml-1 hover:text-primary-600 transition-colors">Términos</a>
      </footer>
    </div>
  );
});
