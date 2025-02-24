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
  title: 'Sprite Sheet Slicer | Free Online Sprite Sheet Splitter Tool',
  description: 'Free online tool to slice Aseprite sprite sheets into individual frames. Easy-to-use sprite sheet splitter for game developers, pixel artists, and indie game makers.',
  keywords: [
    'sprite sheet slicer',
    'sprite sheet splitter',
    'aseprite tool',
    'game development',
    'pixel art',
    'sprite animation',
    'game assets',
    'indie game development',
    'free sprite tool',
    'online sprite editor'
  ],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',
  publisher: 'Your Name',
  openGraph: {
    title: 'Sprite Sheet Slicer - Free Online Sprite Sheet Splitter',
    description: 'Easily slice Aseprite sprite sheets into individual frames. Perfect for game developers and pixel artists.',
    url: 'https://sprite-slicer.vercel.app',
    siteName: 'Sprite Sheet Slicer',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png', // 추가 필요: 공유 시 표시될 이미지
        width: 1200,
        height: 630,
        alt: 'Sprite Sheet Slicer Preview'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sprite Sheet Slicer - Split Sprite Sheets Online',
    description: 'Free online tool to slice sprite sheets into individual frames',
    images: ['/twitter-image.png'], // 추가 필요: 트위터 공유용 이미지
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
