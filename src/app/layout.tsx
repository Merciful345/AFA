import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "AFA — Asociación de Farmeadores de Aura",
  description:
    "El torneo presencial de farmeo de aura. Inscribite, mostrá tu aura en vivo y competí por el premio mayor. Enfoque, disciplina, aura.",
  openGraph: {
    title: "AFA — Asociación de Farmeadores de Aura",
    description:
      "El torneo presencial de farmeo de aura. Inscribite, mostrá tu aura en vivo y competí por el premio mayor.",
    images: ["/afa-logo.png"],
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body bg-bg0 text-t1">
        <div className="grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
