'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DelegatesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/attendees');
  }, [router]);

  return null;
}
