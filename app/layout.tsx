import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import ToastHost from "@/components/ToastHost";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Olymp'Game — Tournois de jeux vidéo entre amis",
  description:
    "Crée et rejoins des tournois multi-jeux fun et gratuits. Co-organisateurs, barème de points configurable, classements en direct.",
};

export const viewport: Viewport = {
  themeColor: "#0A1F2E",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Nav />
        <main className="min-h-[calc(100vh-68px)]">{children}</main>
        <Footer />
        <ToastHost />
      </body>
    </html>
  );
}
