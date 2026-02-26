import { component$, Slot } from '@builder.io/qwik';

export default component$(() => {
  return (
    <div class="min-h-screen flex flex-col">
      <header class="p-4 border-b flex justify-between items-center">
        <div class="font-bold text-xl">Qwik Pad</div>
        <nav class="flex gap-4">
          <a href="/login" class="text-blue-600 hover:underline">Login</a>
          <a href="/register" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Registro</a>
        </nav>
      </header>
      <main class="flex-1">
        <Slot />
      </main>
      <footer class="p-4 border-t text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Qwik Pad. Todos los derechos reservados.
      </footer>
    </div>
  );
});
