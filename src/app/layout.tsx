import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_PROJECT_NAME,
  description: process.env.NEXT_PUBLIC_PROJECT_DESCRIPTION,
  applicationName: process.env.NEXT_PUBLIC_PROJECT_NAME,
  twitter: {
    card: "summary_large_image",
    site: process.env.NEXT_PUBLIC_PROJECT_URL,
    creator: "@buyholdearn",
    images: "https://flame.buyholdearn.com/preview.jpg",
  },
  openGraph: {
    type: "website",
    url: process.env.NEXT_PUBLIC_PROJECT_URL,
    title: process.env.NEXT_PUBLIC_PROJECT_NAME,
    description: process.env.NEXT_PUBLIC_PROJECT_DESCRIPTION,
    siteName: process.env.NEXT_PUBLIC_PROJECT_NAME,
    images: [
      {
        url: "https://flame.buyholdearn.com/preview.jpg",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
