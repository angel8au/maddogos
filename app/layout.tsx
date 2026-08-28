import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { SerwistProviderWrapper } from "@/components/pwa/serwist-provider";
import { WarmCache } from "@/components/pwa/warm-cache";
import { GoogleTagManager, GoogleTagManagerNoScript } from "@/components/gtm";
import { AnalyticsProvider } from "@/components/providers/analytics-provider";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { MenuCatalogProvider } from "@/components/providers/menu-catalog-provider";
import { CartUI } from "@/components/cart/cart-ui";
import { SkipToContent } from "@/components/skip-to-content";
import { RestaurantJsonLd } from "@/components/seo/restaurant-jsonld";
import { getMenuPageData } from "@/lib/queries";
import { SITE_NAME, SITE_URL } from "@/lib/site-url";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const defaultTitle =
  "Mad Dogos | Hot Dogs y Hamburguesas a Domicilio en Culiacán";
const defaultDescription =
  "Pide tus hot dogs, hamburguesas, alitas y boneless a domicilio en Culiacán. Mad Dogos Hotdogs — entrega rápida directo por WhatsApp.";

export const metadata: Metadata = {
  applicationName: "Mad Dogos",
  title: {
    default: defaultTitle,
    template: "%s | Mad Dogos Culiacán",
  },
  description: defaultDescription,
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "48x48" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mad Dogos",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: defaultTitle,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#CC1717",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { items, sauceOptions } = await getMenuPageData();

  return (
    <html
      lang="es-MX"
      className={`${bebasNeue.variable} ${inter.variable} h-full antialiased light`}
      style={{ colorScheme: "light" }}
    >
      <body className="min-h-full flex flex-col">
        <GoogleTagManagerNoScript />
        <RestaurantJsonLd />
        <SkipToContent />
        <GoogleTagManager />
        <SerwistProviderWrapper>
          <PostHogProvider>
            <AnalyticsProvider>
              <CartProvider>
                <MenuCatalogProvider
                  initialItems={items}
                  initialSauceOptions={sauceOptions}
                >
                  {children}
                  <CartUI />
                  <WarmCache />
                  <InstallPrompt />
                </MenuCatalogProvider>
              </CartProvider>
            </AnalyticsProvider>
          </PostHogProvider>
        </SerwistProviderWrapper>
      </body>
    </html>
  );
}
