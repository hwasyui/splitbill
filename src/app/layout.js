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

export const metadata = {
  title: "Angelica's Split Bill | Angelica Suti Whiharto",
  description:
    "Upload a receipt, review the items, assign each one to your group, and instantly see how much everyone owes. Fast, free, and works with any currency.",
  keywords: [
    "split bill",
    "receipt splitter",
    "bill calculator",
    "Angelica Split Bill",
    "Angelica Suti Whiharto",
    "expense sharing",
    "group bill",
  ],
  metadataBase: new URL("https://splitbill.angelica-whiharto.com"),
  openGraph: {
    title: "Angelica's Split Bill | Angelica Suti Whiharto",
    description:
      "Upload a receipt, assign each item to your group, and instantly see how much everyone owes.",
    url: "https://splitbill.angelica-whiharto.com",
    siteName: "Angelica's Split Bill",
    images: [
      {
        url: "/image.png",
        width: 1200,
        height: 630,
        alt: "Angelica's Split Bill — Receipt Splitter",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: [
      { url: '/angel-logo.svg', type: 'image/svg+xml' },
      { url: '/angel-logo.png', type: 'image/png' },
    ],
    apple: '/angel-logo.png',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://splitbill.angelica-whiharto.com/",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="google-site-verification" content="kRHhLJFUa4ChPorNRsbLNM6jVWx7VKET_upCs7bx0NM" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
