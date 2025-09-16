"use client"

import Link from "next/link"
import { useState } from "react"
import { Leaf, Recycle, Coins, Users, Shield, Smartphone, TrendingUp, Award, MapPin, Clock, Star, CheckCircle, Menu, X } from "lucide-react"

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-xl border-b border-emerald-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <img src="/logo.png" className="w-10 h-10 sm:h-8 sm:w-8" alt="" />
              <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                RUMAH BANK SAMPAH PKS TERANTAM
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/auth/signin" 
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-200"
              >
                Masuk
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-emerald-600 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-emerald-100 bg-white/95 backdrop-blur-xl">
              <div className="flex flex-col space-y-3 pt-4">
                <Link 
                  href="/auth/signin" 
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center rounded-xl font-medium transition-all shadow-lg shadow-emerald-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Masuk
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/80 rounded-full border border-emerald-200 mb-4 sm:mb-6">
            <span className="text-emerald-600 text-xs sm:text-sm font-medium">🌱 Platform Bank Sampah Terdepan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Rumah Bank Sampah 
            <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              PKS Terantam Masa Depan
            </span>
            Masa Depan
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-8 sm:mb-10 leading-relaxed max-w-3xl mx-auto px-2">
            Revolusi pengelolaan sampah dengan teknologi AI dan blockchain. Ubah sampah rumah tangga menjadi aset digital yang menguntungkan dengan sistem yang transparan dan aman.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-4 sm:px-0">
            <Link 
              href="/auth/signin"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-semibold transition-all shadow-xl shadow-emerald-200 text-center"
            >
              Mulai Sekarang
            </Link>
            <Link 
              href="/waste-items"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white/90 text-emerald-700 border border-emerald-200 rounded-2xl font-semibold transition-all shadow-lg text-center"
            >
              Lihat Harga Sampah
            </Link>
          </div>
          
          {/* Hero Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-emerald-600">5000+</div>
              <div className="text-xs sm:text-sm text-gray-500">Pengguna Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-emerald-600">50 Ton</div>
              <div className="text-xs sm:text-sm text-gray-500">Sampah Terdaur</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-emerald-600">₨2.5M</div>
              <div className="text-xs sm:text-sm text-gray-500">Total Payout</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-emerald-600">25+</div>
              <div className="text-xs sm:text-sm text-gray-500">Jenis Sampah</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Mengapa RUMAH BANK SAMPAH PKS TERANTAM Berbeda?
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto px-2">
            Platform terintegrasi dengan teknologi terdepan untuk pengalaman bank sampah yang tak tertandingi
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-emerald-100 transition-all"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Cara Kerja Sederhana
          </h2>
          <p className="text-gray-600 text-base sm:text-lg px-2">
            Hanya 4 langkah mudah untuk mulai menghasilkan dari sampah Anda
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-xl sm:text-2xl font-bold text-white">{index + 1}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 sm:top-10 left-full w-full h-0.5 bg-gradient-to-r from-emerald-200 to-teal-200 transform translate-x-4"></div>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{step.title}</h3>
              <p className="text-gray-600 text-sm sm:text-base px-2">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Waste Types */}
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Jenis Sampah yang Kami Terima
          </h2>
          <p className="text-gray-600 text-base sm:text-lg px-2">
            Berbagai kategori sampah dengan harga kompetitif
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {wasteTypes.map((type, index) => (
            <div key={index} className="bg-white/90 rounded-2xl p-4 sm:p-6 border border-emerald-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">{type.name}</h3>
                <span className="text-xl sm:text-2xl">{type.icon}</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-emerald-600 mb-2">{type.price}</div>
              <p className="text-gray-600 text-xs sm:text-sm mb-4">{type.description}</p>
              <div className="flex flex-wrap gap-2">
                {type.examples.map((example, idx) => (
                  <span key={idx} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-lg">
                    {example}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Kata Mereka Tentang RUMAH BANK SAMPAH PKS TERANTAM
          </h2>
          <p className="text-gray-600 text-base sm:text-lg px-2">
            Pengalaman nyata dari pengguna setia kami
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white/90 rounded-2xl p-6 sm:p-8 border border-emerald-100">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-4 sm:mb-6 italic text-sm sm:text-base">"{testimonial.text}"</p>
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                  <span className="text-white font-semibold text-sm sm:text-base">{testimonial.name[0]}</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">{testimonial.name}</div>
                  <div className="text-gray-500 text-xs sm:text-sm">{testimonial.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Pertanyaan Umum
          </h2>
          <p className="text-gray-600 text-base sm:text-lg px-2">
            Jawaban untuk pertanyaan yang sering ditanyakan
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white/90 rounded-2xl p-4 sm:p-6 border border-emerald-100">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">{faq.question}</h3>
              <p className="text-gray-600 text-sm sm:text-base">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 sm:p-12 text-center border border-emerald-200">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
            Siap Memulai Perjalanan Hijau Anda?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Bergabunglah dengan ribuan pengguna yang telah merasakan manfaat finansial dan lingkungan dari RUMAH BANK SAMPAH PKS TERANTAM
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link 
              href="/auth/signin"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-semibold shadow-xl shadow-emerald-200"
            >
              Masuk Sekarang
              <Leaf className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
            <Link 
              href="/contact"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-emerald-700 border border-emerald-200 rounded-2xl font-semibold shadow-lg text-center"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <img src="/logo.png" className="h-10 w-10 sm:w-8 sm:h-8" alt="" />
                <span className="text-lg sm:text-xl font-bold">RUMAH BANK SAMPAH PKS TERANTAM</span>
              </div>
              <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
                Platform bank sampah digital terdepan untuk masa depan yang lebih hijau dan berkelanjutan.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-xs sm:text-sm">FB</span>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-xs sm:text-sm">IG</span>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-xs sm:text-sm">TW</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Platform</h3>
              <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
                <li><Link href="/waste-items">Harga Sampah</Link></li>
                <li><Link href="/pickup">Layanan Pickup</Link></li>
                <li><Link href="/rewards">Program Reward</Link></li>
                <li><Link href="/community">Komunitas</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Perusahaan</h3>
              <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
                <li><Link href="/about">Tentang Kami</Link></li>
                <li><Link href="/careers">Karir</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/press">Press Kit</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Dukungan</h3>
              <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
                <li><Link href="/help">Pusat Bantuan</Link></li>
                <li><Link href="/contact">Kontak</Link></li>
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400 text-sm sm:text-base">
            <p>&copy; 2025 RUMAH BANK SAMPAH PKS TERANTAM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: Recycle,
    title: "AI Smart Sorting",
    description: "Teknologi AI untuk mengidentifikasi dan menilai sampah secara otomatis dengan akurasi tinggi"
  },
  {
    icon: Coins,
    title: "Instant Payment",
    description: "Sistem pembayaran real-time langsung ke e-wallet atau rekening bank dengan fee minimal"
  },
  {
    icon: Users,
    title: "Community Rewards",
    description: "Program loyalty dan reward eksklusif untuk anggota komunitas yang aktif"
  },
  {
    icon: Shield,
    title: "Blockchain Security",
    description: "Keamanan transaksi tingkat enterprise dengan teknologi blockchain terdepan"
  }
]

const steps = [
  {
    title: "Daftar & Verifikasi",
    description: "Buat akun dan verifikasi identitas dalam 2 menit"
  },
  {
    title: "Pilah Sampah",
    description: "Pisahkan sampah sesuai kategori dengan panduan aplikasi"
  },
  {
    title: "Scan & Upload",
    description: "Foto sampah dan sistem AI akan menentukan nilai"
  },
  {
    title: "Terima Pembayaran",
    description: "Uang langsung masuk ke akun digital Anda"
  }
]

const wasteTypes = [
  {
    name: "Plastik",
    icon: "🥤",
    price: "₨3,000-8,000/kg",
    description: "Botol plastik, kemasan, dan wadah plastik bersih",
    examples: ["Botol Air", "Kemasan Snack", "Wadah Plastik"]
  },
  {
    name: "Kertas",
    icon: "📄",
    price: "₨1,500-4,000/kg",
    description: "Kertas koran, majalah, kardus, dan dokumen",
    examples: ["Koran", "Majalah", "Kardus", "Kertas HVS"]
  },
  {
    name: "Logam",
    icon: "🔩",
    price: "₨8,000-25,000/kg",
    description: "Aluminium, besi, tembaga, dan logam lainnya",
    examples: ["Kaleng", "Kabel", "Pipa", "Scrap Metal"]
  },
  {
    name: "Elektronik",
    icon: "📱",
    price: "₨50,000-200,000/unit",
    description: "HP bekas, laptop, komponen elektronik",
    examples: ["Smartphone", "Laptop", "Motherboard", "RAM"]
  },
  {
    name: "Kaca",
    icon: "🍾",
    price: "₨1,000-2,500/kg",
    description: "Botol kaca, pecahan kaca, dan cermin",
    examples: ["Botol Wine", "Jar", "Kaca Jendela"]
  },
  {
    name: "Organik",
    icon: "🥬",
    price: "₨500-1,500/kg",
    description: "Kompos, sisa makanan untuk pakan ternak",
    examples: ["Sisa Sayuran", "Kulit Buah", "Daun Kering"]
  }
]

const testimonials = [
  {
    name: "Sarah Muslimah",
    location: "Jakarta Selatan",
    text: "Dalam 3 bulan sudah dapat 500ribu rupiah dari sampah rumah tangga. Prosesnya mudah banget!"
  },
  {
    name: "Budi Hartono",
    location: "Bandung",
    text: "Sebagai pemilik warung, RUMAH BANK SAMPAH PKS TERANTAM membantu saya mengolah sampah jadi tambahan penghasilan."
  },
  {
    name: "Indira Sari",
    location: "Surabaya",
    text: "Aplikasinya user-friendly, customer service responsif. Recommended untuk semua keluarga."
  }
]

const appFeatures = [
  {
    icon: Smartphone,
    title: "Scan & Identify",
    description: "AI scanner untuk identifikasi otomatis jenis dan nilai sampah"
  },
  {
    icon: MapPin,
    title: "Pickup Service",
    description: "Layanan jemput sampah langsung ke rumah sesuai jadwal"
  },
  {
    icon: TrendingUp,
    title: "Portfolio Tracking",
    description: "Monitor pendapatan dan kontribusi lingkungan secara real-time"
  }
]

const faqs = [
  {
    question: "Bagaimana cara menentukan harga sampah?",
    answer: "Harga ditentukan berdasarkan jenis, kualitas, dan kondisi pasar saat ini. Sistem AI kami memberikan penilaian yang akurat dan transparan."
  },
  {
    question: "Apakah ada minimum jumlah sampah untuk pickup?",
    answer: "Minimum 5kg untuk layanan pickup gratis. Untuk jumlah dibawah itu, Anda bisa drop-off ke partner collection point terdekat."
  },
  {
    question: "Kapan saya bisa menarik uang hasil penjualan sampah?",
    answer: "Pencairan bisa dilakukan kapan saja dengan minimum withdrawal Rp 50,000. Proses transfer maksimal 1x24 jam."
  },
  {
    question: "Apakah RUMAH BANK SAMPAH PKS TERANTAM tersedia di seluruh Indonesia?",
    answer: "Saat ini kami melayani Jakarta, Bandung, Surabaya, dan Medan. Ekspansi ke kota lain sedang dalam tahap pengembangan."
  }
]
