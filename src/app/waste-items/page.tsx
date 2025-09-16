'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Leaf, ArrowLeft, Search, Package, Tag, AlertCircle, RefreshCw, Menu, X, Recycle } from "lucide-react"

interface Category {
  id: string
  name: string
  description?: string
}

interface WasteItem {
  id: string
  name: string
  price: number
  unit: string
  isActive: boolean
  category: Category
}

interface ApiResponse {
  success: boolean
  data?: WasteItem[]
  count?: number
  error?: string
}

export default function WasteItemsPage() {
  const [wasteItems, setWasteItems] = useState<WasteItem[]>([])
  const [filteredItems, setFilteredItems] = useState<WasteItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetchWasteItems()
  }, [])

  useEffect(() => {
    filterItems()
  }, [wasteItems, searchTerm, selectedCategory])

  const fetchWasteItems = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch all active items and categories separately if needed
      const wasteItemsResponse = await fetch('/api/waste-items?isActive=true')
      
      if (!wasteItemsResponse.ok) {
        throw new Error(`HTTP error! status: ${wasteItemsResponse.status}`)
      }
      
      const wasteItemsData: ApiResponse = await wasteItemsResponse.json()
      
      if (!wasteItemsData.success) {
        throw new Error(wasteItemsData.error || 'Failed to fetch waste items')
      }
      
      const items = wasteItemsData.data || []
      setWasteItems(items)
      
      // Extract unique categories from waste items
      const uniqueCategories = items.reduce((acc: Category[], item) => {
        const existingCategory = acc.find(cat => cat.id === item.category.id)
        if (!existingCategory) {
          acc.push(item.category)
        }
        return acc
      }, [])
      
      setCategories(uniqueCategories.sort((a, b) => a.name.localeCompare(b.name)))
      
    } catch (error) {
      console.error('Failed to fetch waste items:', error)
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data')
    } finally {
      setLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = wasteItems

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.category.name.toLowerCase().includes(searchLower)
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category.id === selectedCategory)
    }

    // Sort by category name, then by item name
    filtered.sort((a, b) => {
      const categoryCompare = a.category.name.localeCompare(b.category.name)
      if (categoryCompare !== 0) return categoryCompare
      return a.name.localeCompare(b.name)
    })

    setFilteredItems(filtered)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const groupedItems = filteredItems.reduce((acc, item) => {
    const categoryName = item.category.name
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(item)
    return acc
  }, {} as Record<string, WasteItem[]>)

  const handleRetry = () => {
    fetchWasteItems()
  }

  const clearSearch = () => {
    setSearchTerm('')
    setSelectedCategory('all')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-emerald-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 sm:space-x-4">
              <Link href="/" className="flex items-center space-x-1 sm:space-x-2 hover:opacity-80 transition-opacity">
                <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
              </Link>
              <div className="h-6 w-px bg-emerald-200 hidden sm:block"></div>
              <div className="flex items-center space-x-3">
                <img src="/logo.png" className='h-10 w-10 sm:h-8 sm:w-8' alt="" />
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  RUMAH BANK SAMPAH PKS TERANTAM
                </span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-4">
              <Link 
                href="/auth/signin" 
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-200"
              >
                Masuk
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-gray-600 hover:text-emerald-700 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="sm:hidden mt-4 pb-4 border-t border-emerald-200">
              <div className="flex flex-col space-y-3 pt-4">
                <Link 
                  href="/auth/signin" 
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center rounded-xl font-medium transition-all shadow-lg shadow-emerald-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Masuk
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Header */}
      <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 leading-tight">
            Daftar Harga
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent block">
              Sampah Terbaru
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
            Lihat harga terkini untuk berbagai jenis sampah yang bisa Anda tukarkan dengan uang
          </p>
        </div>

        {/* Search and Filter */}
        <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-emerald-100">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari jenis sampah..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 placeholder:text-gray-500 text-black border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
              
              {/* Category Filter */}
              <div className="sm:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 placeholder:text-gray-500 text-black border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters Button */}
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={clearSearch}
                  className="px-4 py-2 text-emerald-600 hover:text-emerald-800 font-medium transition-colors whitespace-nowrap text-sm sm:text-base"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Results Count */}
            {!loading && !error && (
              <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
                Menampilkan {filteredItems.length} dari {wasteItems.length} item sampah
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12 sm:py-16">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Memuat data harga sampah...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 sm:py-16">
            <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Terjadi Kesalahan</h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base px-4 sm:px-0">{error}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors text-sm sm:text-base"
            >
              <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Coba Lagi
            </button>
          </div>
        ) : Object.keys(groupedItems).length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Tidak ada sampah ditemukan</h3>
            <p className="text-gray-600 mb-4 text-sm sm:text-base px-4 sm:px-0">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Coba ubah kata kunci pencarian atau filter kategori' 
                : 'Belum ada data sampah yang tersedia'
              }
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={clearSearch}
                className="text-emerald-600 hover:text-emerald-800 font-medium text-sm sm:text-base"
              >
                Tampilkan Semua Item
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-12">
            {Object.entries(groupedItems).map(([categoryName, items]) => (
              <div key={categoryName}>
                {/* Category Header */}
                <div className="flex items-center mb-4 sm:mb-6">
                  <Tag className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 mr-2 flex-shrink-0" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex-shrink-0">{categoryName}</h2>
                  <span className="ml-2 sm:ml-3 px-2 sm:px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs sm:text-sm font-medium flex-shrink-0">
                    {items.length} item{items.length > 1 ? 's' : ''}
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-emerald-300 to-transparent ml-2 sm:ml-4"></div>
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border border-emerald-100"
                    >
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-base sm:text-lg mb-1 line-clamp-2 leading-tight">
                            {item.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-emerald-600 font-medium truncate">
                            {item.category.name}
                          </p>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center flex-shrink-0 ml-2 sm:ml-3">
                          <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                      </div>
                      
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm sm:text-base">Harga:</span>
                          <span className="font-bold text-emerald-600 text-base sm:text-lg">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm sm:text-base">Per:</span>
                          <span className="font-medium text-gray-700 px-2 py-1 bg-gray-100 rounded-md text-xs sm:text-sm">
                            {item.unit}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-gray-100">
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Status:</span>
                            <span className={`px-2 py-1 rounded-full font-medium text-xs ${
                              item.isActive 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {item.isActive ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center mt-12 sm:mt-16">
          <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-6 sm:p-8 lg:p-12 border border-emerald-200">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
              Siap Mulai Mengumpulkan Sampah?
            </h3>
            <p className="text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Daftar sekarang dan mulai tukarkan sampah Anda dengan uang tunai. 
              Proses mudah, cepat, dan menguntungkan!
            </p>
            <Link 
              href="/auth/signin"
              className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all transform hover:scale-105 shadow-xl text-sm sm:text-base"
            >
              Masuk Sekarang
              <Leaf className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <img src="/logo.png" className='h-10 w-10 sm:w-8 sm:h-8' alt="" />
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
