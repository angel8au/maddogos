import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { SerwistProviderWrapper } from "@/components/pwa/serwist-provider";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { MenuCatalogProvider } from "@/components/providers/menu-catalog-provider";
import { CartUI } from "@/components/cart/cart-ui";
import { LocalBusinessJsonLd } from "@/components/local-business-jsonld";
import { getMenuPageData } from "@/lib/queries";

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

export const metadata: Metadata = {
  applicationName: "Mad Dogos",
  title: {
    default: "Mad Dogos | Hot Dogs y Hamburguesas a Domicilio en Culiacán",
    template: "%s | Mad Dogos Culiacán",
  },
  description:
    "Pide tus hot dogs, hamburguesas, alitas y boneless a domicilio en Culiacán. Mad Dogos Hotdogs — entrega rápida directo por WhatsApp.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://maddogos.vercel.app",
  ),
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
    siteName: "Mad Dogos Hotdogs",
    locale: "es_MX",
    type: "website",
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
  maximumScale: 1,
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
        <LocalBusinessJsonLd />
        <SerwistProviderWrapper>
          <PostHogProvider>
            <CartProvider>
              <MenuCatalogProvider
                initialItems={items}
                initialSauceOptions={sauceOptions}
              >
                {children}
                <CartUI />
                <InstallPrompt />
              </MenuCatalogProvider>
            </CartProvider>
          </PostHogProvider>
        </SerwistProviderWrapper>
      </body>
    </html>
  );
}
