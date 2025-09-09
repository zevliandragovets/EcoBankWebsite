import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "./Providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EcoBank - Bank Sampah Digital Modern",
  description: "Transformasi sampah menjadi nilai ekonomi dengan teknologi digital yang mudah dan efisien. Bergabunglah dengan revolusi ekonomi sirkular untuk masa depan yang lebih hijau.",
  keywords: "bank sampah, digital, sampah, daur ulang, lingkungan, ekonomi sirkular",
  authors: [{ name: "EcoBank Team" }],
  creator: "EcoBank",
  publisher: "EcoBank",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://ecobank.vercel.app"),
  openGraph: {
    title: "EcoBank - Bank Sampah Digital Modern",
    description: "Transformasi sampah menjadi nilai ekonomi dengan teknologi digital",
    url: "https://ecobank.vercel.app",
    siteName: "EcoBank",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EcoBank - Bank Sampah Digital",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EcoBank - Bank Sampah Digital Modern",
    description: "Transformasi sampah menjadi nilai ekonomi dengan teknologi digital",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#059669" />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <main className="min-h-screen">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  )
}