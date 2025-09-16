import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "./Providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RUMAH BANK SAMPAH PKS TERANTAM - Bank Sampah Digital Modern",
  description: "Transformasi sampah menjadi nilai ekonomi dengan teknologi digital yang mudah dan efisien. Bergabunglah dengan revolusi ekonomi sirkular untuk masa depan yang lebih hijau.",
  keywords: "bank sampah, digital, sampah, daur ulang, lingkungan, ekonomi sirkular",
  authors: [{ name: "RUMAH BANK SAMPAH PKS TERANTAM Team" }],
  creator: "RUMAH BANK SAMPAH PKS TERANTAM",
  publisher: "RUMAH BANK SAMPAH PKS TERANTAM",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://rumahbanksampahpksterantam.vercel.app"),
  openGraph: {
    title: "RUMAH BANK SAMPAH PKS TERANTAM - Bank Sampah Digital Modern",
    description: "Transformasi sampah menjadi nilai ekonomi dengan teknologi digital",
    url: "https://rumahbanksampahpksterantam.vercel.app",
    siteName: "RUMAH BANK SAMPAH PKS TERANTAM",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "RUMAH BANK SAMPAH PKS TERANTAM - Bank Sampah Digital",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RUMAH BANK SAMPAH PKS TERANTAM - Bank Sampah Digital Modern",
    description: "Transformasi sampah menjadi nilai ekonomi dengan teknologi digital",
    images: ["/logo.png"],
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
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo.png" />
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
