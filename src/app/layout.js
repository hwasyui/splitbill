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
  title: "Split Bill Website",
  description: "Split bills easily with friends. Created with love by github.com/hwasyui",
  metadataBase: new URL("https://splitbill.angelicas.xyz"),
  openGraph: {
    title: "Split Bill Website",
    description: "Split bills easily with friends. Try it free now!",
    url: "https://splitbill.angelicas.xyz",
    siteName: "Split Bill",
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
  icons: {
    icon: "favicon.ico", 
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://splitbill.angelicas.xyz/" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
