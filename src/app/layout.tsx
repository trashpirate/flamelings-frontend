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
    site: "flame.buyholdearn.com",
    creator: "@buyholdearn",
    images: "https://flame.buyholdearn.com/preview.jpeg",
  },
  openGraph: {
    type: "website",
    url: "https://flame.buyholdearn.com",
    title: "Flamelings",
    description:
      "The adorable Flamelings embody the warmth and energy of the fire they are born from. Funny, powerful, brave, patient, and dependable, they reflect the diverse qualities of the EARN community.",
    siteName: "Flamelings",
    images: [
      {
        url: "https://flame.buyholdearn.com/preview.jpeg",
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
