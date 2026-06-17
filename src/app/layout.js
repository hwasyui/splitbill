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
  title: "Angelica's Splitbill - Split Bill App by Angelica Suti Whiharto",
  description:
    "Angelica's Splitbill is a simple split bill app by Angelica Suti Whiharto for sharing receipts and expenses with friends.",
  keywords: [
    "Angelica's Splitbill",
    "Angelica Split Bill",
    "Angelica Splitbill",
    "Split Bill",
    "Angelica Suti Whiharto",
    "Angelica Suti Whiharto splitbill",
  ],
  metadataBase: new URL("https://splitbill.angelica-whiharto.com"),
  openGraph: {
    title: "Angelica's Splitbill - Split Bill App",
    description:
      "Split receipts and expenses with Angelica's Splitbill by Angelica Suti Whiharto.",
    url: "https://splitbill.angelica-whiharto.com",
    siteName: "Angelica's Splitbill",
    images: [
      {
        url: "/image.png",
        width: 1200,
        height: 630,
        alt: "Split Bill App",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://splitbill.angelica-whiharto.com/",
  },
  icons: {
    icon: "favicon.ico", 
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
