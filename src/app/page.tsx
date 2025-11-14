'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/onboarding');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p>Redirecting to onboarding...</p>
    </div>
  );
}
