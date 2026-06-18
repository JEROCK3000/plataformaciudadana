import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#059669",
};

export const metadata: Metadata = {
  title: "Participación Ciudadana",
  description: "Plataforma SaaS para reportes ciudadanos de smart cities.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Portal Ciudadano",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <footer className="bg-gray-900 text-gray-500 text-xs text-center py-3 mt-auto">
          Desarrollado por{' '}
          <span className="text-emerald-400 font-semibold">SOLINTEEC DEVS &amp; TECH</span>
          {' '}— GAD Municipal Quijos &copy; {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}
