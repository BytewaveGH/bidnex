import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import ToastTemplate from "@/components/templates/toast-template";
import { NextAuthProvider } from "@/components/generals/providers/next-auth";
import { WatchlistProvider } from "@/components/generals/providers/watchlist-provider";
import { WebSocketProvider } from "@/components/generals/providers/websocket-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PreferencesStoreProvider } from "@/stores/preferences/preferences-provider";
import { ThemeBootScript } from "@/scripts/theme-boot";
import { PREFERENCE_DEFAULTS } from "@/lib/preferences/preferences-config";
import { fontVars } from "@/lib/fonts/registry";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Bidchale",
  description: "Auction platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme_mode, theme_preset, content_layout, navbar_style, sidebar_variant, sidebar_collapsible, font } =
    PREFERENCE_DEFAULTS;

  return (
    <html
      lang="en"
      data-theme-mode={theme_mode}
      data-theme-preset={theme_preset}
      data-content-layout={content_layout}
      data-navbar-style={navbar_style}
      data-sidebar-variant={sidebar_variant}
      data-sidebar-collapsible={sidebar_collapsible}
      data-font={font}
      suppressHydrationWarning
    >
      <head>
        <ThemeBootScript />
      </head>
      <body className={`${roboto.variable} ${fontVars} antialiased`}>
        <TooltipProvider>
          <PreferencesStoreProvider
            themeMode={theme_mode}
            themePreset={theme_preset}
            contentLayout={content_layout}
            navbarStyle={navbar_style}
            font={font}
          >
            <NextAuthProvider>
              <WebSocketProvider>
                <WatchlistProvider>
                  {children}
                </WatchlistProvider>
              </WebSocketProvider>
              <ToastTemplate />
            </NextAuthProvider>
          </PreferencesStoreProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
