import { component$ } from '@builder.io/qwik';
import LandingPage from './(public)/landing';
import PublicLayout from './(public)/layout';

export default component$(() => {
  return (
    <PublicLayout>
      <LandingPage />
    </PublicLayout>
  );
});
