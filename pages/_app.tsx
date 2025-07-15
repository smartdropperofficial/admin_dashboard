import type { AppProps } from "next/app";
import Head from "next/head";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../src/theme/AppTheme";
import createEmotionCache from "../src/theme/createEmotionCache";
import { CacheProvider, EmotionCache } from "@emotion/react";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

const clientSideEmotionCache: EmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  const { Component, pageProps, emotionCache = clientSideEmotionCache } = props;
  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <CacheProvider value={emotionCache}>
        <Head>AppTheme
          <meta name="viewport" content="initial-scale=1, width=device-width" />
          <title>SmartDropper Dashboard</title>
        </Head>
        {/* AppTheme already contains ThemeProvider and CssVariables */}
        <AppTheme>
          <CssBaseline enableColorScheme />
          <Component {...pageProps} />
        </AppTheme>
      </CacheProvider>
    </SessionContextProvider>
  );
}
