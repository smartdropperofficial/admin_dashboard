// pages/auth/callback.tsx
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function AuthCallback() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [hasMounted, setHasMounted] = useState(false);

  const ranOnce = useRef(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  useEffect(() => {
    if (!hasMounted) return;
    if (ranOnce.current) return;
    ranOnce.current = true;

    (async () => {
      console.log("🔐 [Callback] Init Supabase client");
      console.log("🌐 [Callback] Current URL:", window.location.href);

      const { data, error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      // 🔍 ricavo (in modo sicuro) la sessione già salvata in cookie/localStorage
      const {
        data: { session: cachedSession },
      } = await supabase.auth.getSession();

      if (error) {
        const isPkceNoise =
          error.message.includes("code verifier") && cachedSession;

        if (isPkceNoise) {
          console.warn(
            "ℹ️ Strict-mode double mount: PKCE cookie già consumato."
          );
        } else {
          console.error("🚨 [Callback] Session Error:", error.message);
        }
      } else {
        console.log("✅ [Callback] Session obtained:", data.session);
      }

      router.replace("/");
    })();
  }, [router, supabase]);

  return (
    <p style={{ textAlign: "center", marginTop: "2rem" }}>🔄 Signing you in…</p>
  );
}
