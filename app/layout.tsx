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

const siteUrl = "https://ecc.kxnl.in";
const title = "ECC Visualizer -- Interactive Elliptic Curve Cryptography";
const description =
  "Explore elliptic curve cryptography visually. Step through point addition, scalar multiplication, key generation, and ElGamal encryption/decryption on interactive SVG curves.";

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(siteUrl),
  keywords: [
    "elliptic curve cryptography",
    "ECC",
    "point addition",
    "scalar multiplication",
    "ElGamal encryption",
    "cryptography visualizer",
    "interactive math",
    "public key cryptography",
  ],
  authors: [{ name: "Kunal Singh Dadhwal" }],
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "ECC Visualizer",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ECC Visualizer -- interactive elliptic curve cryptography",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
