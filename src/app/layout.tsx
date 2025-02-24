import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: 'Sprite Sheet Slicer',
  description: 'Online tool to slice sprite sheets into individual sprite images. Easy-to-use web-based sprite sheet splitter for game developers and pixel artists.',
  keywords: ['sprite sheet', 'sprite slicer', 'game development', 'pixel art', 'sprite splitter', 'sprite sheet tool', 'game assets'],
  openGraph: {
    title: 'Sprite Sheet Slicer - Split Sprite Sheets Online',
    description: 'Free online tool to slice sprite sheets into individual sprite images. Perfect for game developers and pixel artists.',
    url: 'https://sprite-slicer.vercel.app',
    siteName: 'Sprite Sheet Slicer',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sprite Sheet Slicer - Split Sprite Sheets Online',
    description: 'Free online tool to slice sprite sheets into individual sprite images',
    creator: '@your_twitter_handle', // 트위터 계정이 있다면 추가
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your_google_site_verification', // Google Search Console 인증 코드
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
