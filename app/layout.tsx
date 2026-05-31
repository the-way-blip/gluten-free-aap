import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiftProvider } from "@/lib/store";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Sift — Eat gluten-free with confidence",
  description:
    "Personalized gluten-free recipes, pantry-based meal ideas, smart shopping lists, and restaurant ordering guides tailored to how strict you need to be.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sift",
  },
};

export const viewport: Viewport = {
  themeColor: "#368856",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Nunito:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <SiftProvider>
          <div className="mx-auto min-h-screen max-w-md pb-24 shadow-xl sm:my-0 sm:min-h-screen">
            {children}
          </div>
          <Nav />
        </SiftProvider>
      </body>
    </html>
  );
}
