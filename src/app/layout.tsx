import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const DESCRIPTION =
  "AVYSTRA helps Indian organizations close the gap between knowing and doing — through leadership development, manager effectiveness, and execution systems";

export const metadata: Metadata = {
  title: "AVYSTRA | Operations & Systems Consulting",
  description: DESCRIPTION,
  keywords: [
    "AVYSTRA",
    "leadership consulting",
    "organizational performance",
    "execution systems",
    "founder autonomy",
    "management consulting",
  ],
  authors: [{ name: "AVYSTRA Consulting" }],
  metadataBase: new URL("https://avystra.co.in"),
  openGraph: {
    title: "AVYSTRA | Operations & Systems Consulting",
    description: DESCRIPTION,
    url: "https://avystra.co.in/",
    siteName: "AVYSTRA",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "AVYSTRA | Operations & Systems Consulting",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  alternates: {
    canonical: "https://avystra.co.in",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F4ED" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1B2E" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to font hosts for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: "AVYSTRA Consulting Private Limited",
              url: "https://avystra.co.in",
              description:
                "AVYSTRA helps Indian organizations close the gap between knowing and doing — through leadership development, manager effectiveness, and execution systems.",
              areaServed: "Worldwide",
            }),
          }}
        />
      </head>
      <body className="antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
