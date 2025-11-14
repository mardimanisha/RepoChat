'use client';

import { createClient } from '@/lib/supabase/client';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useState } from 'react';

export default function SupabaseProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  const [supabaseClient] = useState(() => createClient());

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={session}
    >
      {children}
    </SessionContextProvider>
  );
}
