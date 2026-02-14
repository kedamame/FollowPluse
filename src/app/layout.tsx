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

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://follow-pluse.vercel.app";

export const metadata: Metadata = {
  title: "FollowPulse - Farcaster Rankings",
  description: "Track follower trends of popular Farcaster users",
  openGraph: {
    title: "FollowPulse",
    description: "Track follower trends of popular Farcaster users",
    images: [`${appUrl}/api/og/splash`],
  },
  other: {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: `${appUrl}/api/og/splash`,
      button: {
        title: "Open FollowPulse",
        action: {
          type: "launch_frame",
          name: "FollowPulse",
          url: appUrl,
          splashImageUrl: `${appUrl}/api/og/splash`,
          splashBackgroundColor: "#7c3aed",
        },
      },
    }),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
