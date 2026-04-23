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
    default: "포챔스 포켓몬 커뮤니티",
    template: "%s | 포챔스 포켓몬 커뮤니티"
  },
  description:
    "포챔스 분위기의 포켓몬 정보 공유 커뮤니티. 검색, 랜덤 추천, 상성·특성·진화 정보와 커뮤니티 평점을 한 화면에서 확인할 수 있습니다.",
  keywords: [
    "포켓몬 커뮤니티",
    "포챔스",
    "포켓몬 메타",
    "포켓몬 정보 공유",
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
    title: "포챔스 포켓몬 커뮤니티",
    description:
      "지금 말 많은 포켓몬과 메타 이슈를 같이 정리하는 포켓몬 정보 공유 커뮤니티.",
    siteName: "포챔스 포켓몬 커뮤니티",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "포챔스 포켓몬 커뮤니티 OG 이미지"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "포챔스 포켓몬 커뮤니티",
    description: "포켓몬 메타와 정보를 같이 보는 커뮤니티형 포켓몬 허브",
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
