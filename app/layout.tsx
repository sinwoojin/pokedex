import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "포켓몬 카드 도감",
    template: "%s | 포켓몬 카드 도감"
  },
  description:
    "PokeAPI 기반 포켓몬 카드 도감. 한글/영문 검색, 부분 검색, 타입/약점/진화 과정까지 한 번에 확인할 수 있습니다.",
  keywords: [
    "포켓몬 도감",
    "포켓몬 카드",
    "포켓몬 검색",
    "PokeAPI",
    "Pokemon Dex",
    "Next.js"
  ],
  alternates: {
    canonical: "/"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1
    }
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    title: "포켓몬 카드 도감",
    description:
      "PokeAPI 기반 포켓몬 카드 도감. 한글/영문 검색, 부분 검색, 타입/약점/진화 과정까지 제공.",
    siteName: "포켓몬 카드 도감",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "포켓몬 카드 도감 OG 이미지"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "포켓몬 카드 도감",
    description: "한글/영문 부분 검색 지원 포켓몬 도감",
    images: ["/twitter-image"]
  },
  category: "technology"
};

type RootLayoutProps = {
  children: ReactNode;
};

const gaMeasurementId =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body>{children}</body>
      {gaMeasurementId ? <GoogleAnalytics gaId={gaMeasurementId} /> : null}
    </html>
  );
}
