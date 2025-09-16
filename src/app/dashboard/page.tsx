"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { 
  Wallet, 
  Recycle, 
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  Package,
  History,
  Calculator,
  Trash2,
  Target,
  Award,
  BarChart3,
  Calendar,
  Users,
  Leaf,
  ShoppingCart,
  Star,
  ArrowUp,
  ArrowDown,
  Filter,
  Search,
  MapPin,
  Bell,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Menu,
  X,
  RefreshCw,
  DollarSign,
  Activity,
  PieChart
} from "lucide-react"

interface Transaction {
  id: string
  totalAmount: number
  totalWeight: number
  status: string
  createdAt: string
  updatedAt: string
  items: {
    id: string
    weight: number
    subtotal: number
    price: number
    wasteItem: {
      id: string
      name: string
      price: number
      unit: string
      category: {
        id: string
        name: string
      }
    }
  }[]
  user?: {
    id: string
    name: string
    email: string
  }
}

interface WasteItem {
  id: string
  name: string
  price: number
  unit: string
  isActive: boolean
  category: {
    id: string
    name: string
  }
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  count?: number
  message?: string
  error?: string
}

interface AnalyticsData {
  monthlyEarnings: { month: string; earnings: number; transactions: number }[]
  categoryBreakdown: { category: string; amount: number; weight: number; transactions: number; percentage: number }[]
  weeklyTrends: { week: string; weight: number; earnings: number }[]
  topItems: { name: string; category: string; weight: number; earnings: number }[]
  growthMetrics: {
    earningsGrowth: number
    transactionGrowth: number
    weightGrowth: number
    avgTransactionGrowth: number
  }
}

export default function UserDashboard() {
  const { data: session, status } = useSession()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [wasteItems, setWasteItems] = useState<WasteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedItems, setSelectedItems] = useState<{[key: string]: number}>({})
  const [isCalculating, setIsCalculating] = useState(false)
  const [showBalance, setShowBalance] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Enhanced fetch functions with better error handling
  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store' // Ensure fresh data
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Handle both direct array and wrapped response
      if (Array.isArray(data)) {
        setTransactions(data)
      } else if (data.success && Array.isArray(data.data)) {
        setTransactions(data.data)
      } else {
        throw new Error('Invalid response format for transactions')
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setError(`Failed to fetch transactions: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setTransactions([])
    }
  }, [])

  const fetchWasteItems = useCallback(async () => {
    try {
      const response = await fetch('/api/waste-items?isActive=true', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<WasteItem[]> = await response.json()
      
      if (result.success && Array.isArray(result.data)) {
        setWasteItems(result.data.filter(item => item.isActive))
      } else {
        throw new Error(result.error || 'Invalid response format for waste items')
      }
    } catch (error) {
      console.error('Error fetching waste items:', error)
      setError(`Failed to fetch waste items: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setWasteItems([])
    }
  }, [])

  const fetchData = useCallback(async (showRefreshing = false) => {
    if (status === 'loading') return
    if (!session) {
      setLoading(false)
      return
    }

    if (showRefreshing) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    
    setError(null)
    
    try {
      await Promise.all([fetchTransactions(), fetchWasteItems()])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data. Please try refreshing the page.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [session, status, fetchTransactions, fetchWasteItems])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Enhanced statistics calculation with real-time data
  const stats = useMemo(() => {
    const completedTransactions = transactions.filter(t => t.status === 'COMPLETED')
    const pendingTransactions = transactions.filter(t => t.status === 'PENDING')
    const approvedTransactions = transactions.filter(t => t.status === 'APPROVED')
    const rejectedTransactions = transactions.filter(t => t.status === 'REJECTED')
    
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    
    // Previous month for comparison
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
    
    const thisMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.createdAt)
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear
    })
    
    const lastMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.createdAt)
      return transactionDate.getMonth() === prevMonth && 
             transactionDate.getFullYear() === prevYear
    })
    
    const thisMonthEarnings = completedTransactions
      .filter(t => {
        const transactionDate = new Date(t.createdAt)
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear
      })
      .reduce((sum, t) => sum + t.totalAmount, 0)
    
    const lastMonthEarnings = completedTransactions
      .filter(t => {
        const transactionDate = new Date(t.createdAt)
        return transactionDate.getMonth() === prevMonth && 
               transactionDate.getFullYear() === prevYear
      })
      .reduce((sum, t) => sum + t.totalAmount, 0)

    // Calculate growth percentages
    const earningsGrowth = lastMonthEarnings > 0 
      ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100 
      : thisMonthEarnings > 0 ? 100 : 0

    const transactionGrowth = lastMonthTransactions.length > 0
      ? ((thisMonthTransactions.length - lastMonthTransactions.length) / lastMonthTransactions.length) * 100
      : thisMonthTransactions.length > 0 ? 100 : 0

    return {
      totalBalance: completedTransactions.reduce((sum, t) => sum + t.totalAmount, 0),
      totalTransactions: transactions.length,
      totalWeight: transactions.reduce((sum, t) => sum + t.totalWeight, 0),
      pendingTransactions: pendingTransactions.length,
      approvedTransactions: approvedTransactions.length,
      rejectedTransactions: rejectedTransactions.length,
      completedTransactions: completedTransactions.length,
      thisMonthTransactions: thisMonthTransactions.length,
      thisMonthEarnings,
      lastMonthEarnings,
      avgTransactionValue: completedTransactions.length > 0 
        ? completedTransactions.reduce((sum, t) => sum + t.totalAmount, 0) / completedTransactions.length 
        : 0,
      earningsGrowth,
      transactionGrowth,
      // Environmental impact calculations
      co2Reduced: transactions.reduce((sum, t) => sum + t.totalWeight, 0) * 2.3,
      treesSaved: Math.floor(transactions.reduce((sum, t) => sum + t.totalWeight, 0) / 17),
      // Performance metrics
      successRate: transactions.length > 0 
        ? (completedTransactions.length / transactions.length) * 100 
        : 0
    }
  }, [transactions])

  // Enhanced analytics data calculation
  const analyticsData = useMemo((): AnalyticsData => {
    const categories = [...new Set(wasteItems.map(item => item.category.name))]
    
    // Monthly earnings for the last 6 months
    const monthlyEarnings = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const month = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.createdAt)
        return tDate.getMonth() === date.getMonth() && 
               tDate.getFullYear() === date.getFullYear() &&
               t.status === 'COMPLETED'
      })
      
      monthlyEarnings.push({
        month,
        earnings: monthTransactions.reduce((sum, t) => sum + t.totalAmount, 0),
        transactions: monthTransactions.length
      })
    }

    // Category breakdown with real data
    const categoryBreakdown = categories.map(category => {
      const categoryTransactions = transactions.filter(t => 
        t.items.some(item => item.wasteItem.category.name === category) &&
        t.status === 'COMPLETED'
      )
      
      const amount = categoryTransactions.reduce((sum, t) => sum + t.totalAmount, 0)
      const weight = categoryTransactions.reduce((sum, t) => 
        sum + t.items
          .filter(item => item.wasteItem.category.name === category)
          .reduce((itemSum, item) => itemSum + item.weight, 0), 0)
      
      return {
        category,
        amount,
        weight,
        transactions: categoryTransactions.length,
        percentage: stats.totalBalance > 0 ? (amount / stats.totalBalance) * 100 : 0
      }
    }).filter(item => item.amount > 0)

    // Weekly trends for the last 8 weeks
    const weeklyTrends = []
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (i * 7))
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      
      const weekTransactions = transactions.filter(t => {
        const tDate = new Date(t.createdAt)
        return tDate >= weekStart && tDate <= weekEnd && t.status === 'COMPLETED'
      })
      
      weeklyTrends.push({
        week: `Week ${8-i}`,
        weight: weekTransactions.reduce((sum, t) => sum + t.totalWeight, 0),
        earnings: weekTransactions.reduce((sum, t) => sum + t.totalAmount, 0)
      })
    }

    // Top performing items
    const itemStats = new Map()
    transactions.forEach(t => {
      if (t.status === 'COMPLETED') {
        t.items.forEach(item => {
          const key = item.wasteItem.id
          if (!itemStats.has(key)) {
            itemStats.set(key, {
              name: item.wasteItem.name,
              category: item.wasteItem.category.name,
              weight: 0,
              earnings: 0
            })
          }
          const existing = itemStats.get(key)
          existing.weight += item.weight
          existing.earnings += item.subtotal
        })
      }
    })
    
    const topItems = Array.from(itemStats.values())
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5)

    // Growth metrics comparison
    const currentMonth = new Date().getMonth()
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    
    const thisMonthStats = {
      earnings: monthlyEarnings[monthlyEarnings.length - 1]?.earnings || 0,
      transactions: monthlyEarnings[monthlyEarnings.length - 1]?.transactions || 0
    }
    
    const lastMonthStats = {
      earnings: monthlyEarnings[monthlyEarnings.length - 2]?.earnings || 0,
      transactions: monthlyEarnings[monthlyEarnings.length - 2]?.transactions || 0
    }

    return {
      monthlyEarnings,
      categoryBreakdown,
      weeklyTrends,
      topItems,
      growthMetrics: {
        earningsGrowth: stats.earningsGrowth,
        transactionGrowth: stats.transactionGrowth,
        weightGrowth: 0, // Calculate if needed
        avgTransactionGrowth: 0 // Calculate if needed
      }
    }
  }, [transactions, wasteItems, stats])

  const categories = [...new Set(wasteItems.map(item => item.category.name))]

  const filteredWasteItems = wasteItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category.name === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch && item.isActive
  })

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchTerm === '' || transaction.items.some(item => 
      item.wasteItem.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'amount':
        return b.totalAmount - a.totalAmount
      case 'weight':
        return b.totalWeight - a.totalWeight
      default:
        return 0
    }
  })

  const calculateTotal = () => {
    return Object.entries(selectedItems).reduce((total, [itemId, weight]) => {
      const item = wasteItems.find(w => w.id === itemId)
      return total + (item ? item.price * weight : 0)
    }, 0)
  }

  const handleWeightChange = (itemId: string, weight: number) => {
    if (weight <= 0) {
      const newItems = { ...selectedItems }
      delete newItems[itemId]
      setSelectedItems(newItems)
    } else {
      setSelectedItems({ ...selectedItems, [itemId]: weight })
    }
  }

  const submitTransaction = async () => {
    if (Object.keys(selectedItems).length === 0) {
      setError('Please select at least one waste item')
      return
    }

    setIsCalculating(true)
    setError(null)

    try {
      const items = Object.entries(selectedItems).map(([itemId, weight]) => {
        const item = wasteItems.find(w => w.id === itemId)!
        return {
          wasteItemId: itemId,
          weight,
          price: item.price
        }
      })

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ items })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }

      if (result.success) {
        setSelectedItems({})
        await fetchTransactions() // Refresh transactions
        setActiveTab('history')
        
        // Success feedback
        setError(null)
        
        setTimeout(() => {
          // Clear any success state if implemented
        }, 3000)
      } else {
        throw new Error(result.error || 'Transaction failed')
      }
    } catch (error) {
      console.error('Error submitting transaction:', error)
      setError(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCalculating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-700 bg-green-100 border-green-200'
      case 'APPROVED': return 'text-blue-700 bg-blue-100 border-blue-200'
      case 'PENDING': return 'text-yellow-700 bg-yellow-100 border-yellow-200'
      case 'REJECTED': return 'text-red-700 bg-red-100 border-red-200'
      default: return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Selesai'
      case 'APPROVED': return 'Disetujui'
      case 'PENDING': return 'Pending'
      case 'REJECTED': return 'Ditolak'
      default: return status
    }
  }

  // Authentication check
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-emerald-700 font-medium text-sm sm:text-base">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-600 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">You need to be logged in to access the dashboard.</p>
          <Link 
            href="/login" 
            className="inline-block px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'sell', label: 'Jual Sampah', icon: Plus },
    { id: 'history', label: 'Riwayat', icon: History },
    { id: 'achievements', label: 'Pencapaian', icon: Award }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-emerald-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-1 sm:space-x-2min-w-0 flex-1">
              <img src="/logo.png" className="h-10 w-10 sm:w-12 sm:h-12" alt="" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">RUMAH BANK SAMPAH PKS TERANTAM Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Kelola sampah, raih keuntungan</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh Data"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Desktop User Info */}
              <div className="text-right hidden lg:block">
                <p className="text-sm text-gray-600">Halo, {session?.user?.name}</p>
                <p className="text-xs text-emerald-600 font-medium">
                  {session?.user?.role === 'ADMIN' ? 'Admin' : 'Member Aktif'}
                </p>
              </div>

              <Link 
                href="/"
                className="px-3 py-2 sm:px-4 text-emerald-600 font-medium border border-emerald-200 rounded-lg transition-colors hover:bg-emerald-50 text-sm hidden sm:block"
              >
                Home
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-2 text-gray-600 hover:text-gray-800"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="mt-4 pb-4 border-t border-emerald-100 sm:hidden">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="text-sm text-gray-600">{session?.user?.name}</p>
                    <p className="text-xs text-emerald-600 font-medium">
                      {session?.user?.role === 'ADMIN' ? 'Admin' : 'Member Aktif'}
                    </p>
                  </div>
                </div>
                <Link 
                  href="/"
                  className="px-3 py-2 text-emerald-600 font-medium border border-emerald-200 rounded-lg transition-colors hover:bg-emerald-50 text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-4 sm:mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm break-words">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex bg-white/70 backdrop-blur-sm p-1.5 rounded-2xl mb-6 sm:mb-8 border border-emerald-100 shadow-sm overflow-x-auto scrollbar-hide">
          <div className="flex space-x-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setIsMobileMenuOpen(false)
                }}
                className={`flex items-center px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-white/70'
                }`}
              >
                <tab.icon className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab - Enhanced with real data */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Balance Card with Real Data */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full -translate-y-16 translate-x-16 sm:-translate-y-32 sm:translate-x-32"></div>
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <p className="text-emerald-100 text-base sm:text-lg">Total Saldo</p>
                      <button 
                        onClick={() => setShowBalance(!showBalance)}
                        className="p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                      >
                        {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-3xl sm:text-5xl font-bold mb-2">
                      {showBalance ? `Rp ${stats.totalBalance.toLocaleString('id-ID')}` : 'Rp ••••••••'}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-emerald-100 text-sm sm:text-base">
                        Dari {stats.completedTransactions} transaksi selesai
                      </p>
                      {stats.earningsGrowth !== 0 && (
                        <div className={`flex items-center text-xs px-2 py-1 rounded-full ${
                          stats.earningsGrowth > 0 ? 'bg-green-400/20' : 'bg-red-400/20'
                        }`}>
                          {stats.earningsGrowth > 0 ? (
                            <ArrowUp className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(stats.earningsGrowth).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-4 sm:p-6 bg-white/20 rounded-2xl sm:rounded-3xl backdrop-blur-sm self-start">
                    <Wallet className="h-12 w-12 sm:h-16 sm:w-16" />
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-white/20">
                  <div className="text-center">
                    <p className="text-lg sm:text-2xl font-bold">{stats.thisMonthTransactions}</p>
                    <p className="text-emerald-100 text-xs sm:text-sm">Transaksi Bulan Ini</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-2xl font-bold">Rp {stats.thisMonthEarnings.toLocaleString('id-ID')}</p>
                    <p className="text-emerald-100 text-xs sm:text-sm">Pendapatan Bulan Ini</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-2xl font-bold">{stats.totalWeight.toFixed(1)} kg</p>
                    <p className="text-emerald-100 text-xs sm:text-sm">Total Berat Sampah</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid with Real Performance Indicators */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-100 shadow-lg">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-green-100 rounded-lg sm:rounded-xl">
                    <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                  <div className="flex items-center text-green-600 text-xs sm:text-sm">
                    <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {stats.successRate.toFixed(1)}%
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{stats.completedTransactions}</p>
                <p className="text-gray-600 text-xs sm:text-sm">Transaksi Selesai</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-100 shadow-lg">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl">
                    <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  </div>
                  <div className="flex items-center text-blue-600 text-xs sm:text-sm">
                    {stats.transactionGrowth >= 0 ? (
                      <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    )}
                    {Math.abs(stats.transactionGrowth).toFixed(1)}%
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{stats.approvedTransactions}</p>
                <p className="text-gray-600 text-xs sm:text-sm">Disetujui</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-100 shadow-lg">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg sm:rounded-xl">
                    <Package className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                  </div>
                  <div className="text-yellow-600 text-xs sm:text-sm">Pending</div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{stats.pendingTransactions}</p>
                <p className="text-gray-600 text-xs sm:text-sm">Menunggu Review</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-100 shadow-lg">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-emerald-100 rounded-lg sm:rounded-xl">
                    <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
                  </div>
                  <div className="text-emerald-600 text-xs sm:text-sm">Rata-rata</div>
                </div>
                <p className="text-xl sm:text-3xl font-bold text-gray-800 mb-1">
                  Rp {Math.round(stats.avgTransactionValue).toLocaleString('id-ID')}
                </p>
                <p className="text-gray-600 text-xs sm:text-sm">Per Transaksi</p>
              </div>
            </div>

            {/* Impact and Quick Actions with Real Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-100 shadow-lg">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
                  <Leaf className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                  Dampak Lingkungan
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-emerald-50 rounded-xl">
                    <div className="flex items-center min-w-0">
                      <div className="p-2 bg-emerald-200 rounded-lg mr-3 flex-shrink-0">
                        <Recycle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-sm sm:text-base">CO₂ Dikurangi</p>
                        <p className="text-xs sm:text-sm text-gray-600">Berkat aktivitas daur ulang</p>
                      </div>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-emerald-600">
                      {stats.co2Reduced.toFixed(1)} kg
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center min-w-0">
                      <div className="p-2 bg-blue-200 rounded-lg mr-3 flex-shrink-0">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-sm sm:text-base">Pohon Diselamatkan</p>
                        <p className="text-xs sm:text-sm text-gray-600">Setara dengan</p>
                      </div>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-blue-600">
                      {stats.treesSaved} pohon
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 bg-purple-50 rounded-xl">
                    <div className="flex items-center min-w-0">
                      <div className="p-2 bg-purple-200 rounded-lg mr-3 flex-shrink-0">
                        <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-purple-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-sm sm:text-base">Success Rate</p>
                        <p className="text-xs sm:text-sm text-gray-600">Transaksi berhasil</p>
                      </div>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-purple-600">
                      {stats.successRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-100 shadow-lg">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                  Aksi Cepat
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <button 
                    onClick={() => setActiveTab('sell')}
                    className="w-full flex items-center p-3 sm:p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl transition-all duration-200 hover:from-emerald-600 hover:to-teal-600"
                  >
                    <Plus className="mr-3 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-semibold text-sm sm:text-base">Jual Sampah Baru</div>
                      <div className="text-xs sm:text-sm opacity-90">Mulai transaksi sekarang</div>
                    </div>
                    <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5 rotate-45 flex-shrink-0" />
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('history')}
                    className="w-full flex items-center p-3 sm:p-4 bg-white border-2 border-emerald-200 text-emerald-700 rounded-xl transition-all duration-200 hover:bg-emerald-50"
                  >
                    <History className="mr-3 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-semibold text-sm sm:text-base">Lihat Riwayat</div>
                      <div className="text-xs sm:text-sm opacity-75">{transactions.length} transaksi total</div>
                    </div>
                    <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5 rotate-45 flex-shrink-0" />
                  </button>

                  <button 
                    onClick={() => setActiveTab('analytics')}
                    className="w-full flex items-center p-3 sm:p-4 bg-white border-2 border-blue-200 text-blue-700 rounded-xl transition-all duration-200 hover:bg-blue-50"
                  >
                    <BarChart3 className="mr-3 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-semibold text-sm sm:text-base">Analisis</div>
                      <div className="text-xs sm:text-sm opacity-75">Lihat performa Anda</div>
                    </div>
                    <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5 rotate-45 flex-shrink-0" />
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Transactions Preview with Real Data */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-100 shadow-lg">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Transaksi Terbaru</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    Total: {transactions.length}
                  </span>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className="text-emerald-600 font-medium text-sm hover:text-emerald-700 transition-colors"
                  >
                    Lihat Semua
                  </button>
                </div>
              </div>
              
              {transactions.slice(0, 3).length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <Package className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm sm:text-base">Belum ada transaksi</p>
                  <button 
                    onClick={() => setActiveTab('sell')}
                    className="mt-3 text-emerald-600 font-medium text-sm hover:text-emerald-700 transition-colors"
                  >
                    Mulai Jual Sampah
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 3).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center min-w-0">
                        <div className="p-2 bg-emerald-100 rounded-lg mr-3 flex-shrink-0">
                          <Package className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 text-sm sm:text-base">
                            #{transaction.id.slice(-6)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {new Date(transaction.createdAt).toLocaleDateString('id-ID')} • {transaction.totalWeight}kg
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600 text-sm sm:text-base">
                          Rp {transaction.totalAmount.toLocaleString('id-ID')}
                        </p>
                        <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                          {getStatusLabel(transaction.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Analytics Tab with Real Backend Data */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Analytics Header with Key Metrics */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-100 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                  Analisis Performa
                </h3>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Activity className="h-4 w-4" />
                  <span>Data Real-time dari Database</span>
                </div>
              </div>
              
              {/* Performance Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                  <div className="flex items-center justify-center mb-2">
                    <Package className="h-5 w-5 text-emerald-600 mr-1" />
                    <span className="text-xs text-emerald-700 font-medium">TOTAL</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{transactions.length}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Total Transaksi</p>
                  {stats.transactionGrowth !== 0 && (
                    <div className={`flex items-center justify-center mt-1 text-xs ${
                      stats.transactionGrowth > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stats.transactionGrowth > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                      {Math.abs(stats.transactionGrowth).toFixed(1)}%
                    </div>
                  )}
                </div>
                
                <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="h-5 w-5 text-blue-600 mr-1" />
                    <span className="text-xs text-blue-700 font-medium">BERAT</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.totalWeight.toFixed(1)}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Total Berat (kg)</p>
                  <div className="text-xs text-gray-500 mt-1">
                    Rata-rata: {(stats.totalWeight / Math.max(transactions.length, 1)).toFixed(1)}kg
                  </div>
                </div>
                
                <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="flex items-center justify-center mb-2">
                    <DollarSign className="h-5 w-5 text-green-600 mr-1" />
                    <span className="text-xs text-green-700 font-medium">AVG</span>
                  </div>
                  <p className="text-xl sm:text-3xl font-bold text-green-600">
                    Rp {Math.round(stats.avgTransactionValue).toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Rata-rata per Transaksi</p>
                  {stats.earningsGrowth !== 0 && (
                    <div className={`flex items-center justify-center mt-1 text-xs ${
                      stats.earningsGrowth > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stats.earningsGrowth > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                      {Math.abs(stats.earningsGrowth).toFixed(1)}%
                    </div>
                  )}
                </div>
                
                <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                  <div className="flex items-center justify-center mb-2">
                    <PieChart className="h-5 w-5 text-yellow-600 mr-1" />
                    <span className="text-xs text-yellow-700 font-medium">RATE</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.successRate.toFixed(1)}%</p>
                  <p className="text-xs sm:text-sm text-gray-600">Success Rate</p>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.completedTransactions}/{transactions.length} selesai
                  </div>
                </div>
              </div>

              {/* Monthly Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
                    Bulan Ini vs Bulan Lalu
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pendapatan:</span>
                      <div className="flex items-center">
                        <span className="font-semibold text-emerald-600 text-sm">
                          Rp {stats.thisMonthEarnings.toLocaleString('id-ID')}
                        </span>
                        {stats.earningsGrowth !== 0 && (
                          <span className={`ml-2 text-xs flex items-center ${
                            stats.earningsGrowth > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stats.earningsGrowth > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            {Math.abs(stats.earningsGrowth).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Transaksi:</span>
                      <div className="flex items-center">
                        <span className="font-semibold text-blue-600 text-sm">
                          {stats.thisMonthTransactions}
                        </span>
                        {stats.transactionGrowth !== 0 && (
                          <span className={`ml-2 text-xs flex items-center ${
                            stats.transactionGrowth > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stats.transactionGrowth > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            {Math.abs(stats.transactionGrowth).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
                    Status Breakdown
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Selesai:</span>
                      <span className="font-semibold text-green-600 text-sm">{stats.completedTransactions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Disetujui:</span>
                      <span className="font-semibold text-blue-600 text-sm">{stats.approvedTransactions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pending:</span>
                      <span className="font-semibold text-yellow-600 text-sm">{stats.pendingTransactions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Ditolak:</span>
                      <span className="font-semibold text-red-600 text-sm">{stats.rejectedTransactions}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Performance Analysis */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-100 shadow-lg">
              <h4 className="font-semibold text-gray-800 mb-4 text-sm sm:text-base flex items-center">
                <PieChart className="h-4 w-4 mr-2 text-emerald-600" />
                Breakdown per Kategori (Transaksi Selesai)
              </h4>
              {analyticsData.categoryBreakdown.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm sm:text-base">Belum ada data kategori</p>
                  <p className="text-gray-400 text-xs">Data akan muncul setelah ada transaksi yang selesai</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analyticsData.categoryBreakdown.map((category) => (
                    <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center min-w-0">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded mr-3 flex-shrink-0"></div>
                        <div className="min-w-0">
                          <span className="font-medium text-gray-800 text-sm sm:text-base truncate block">
                            {category.category}
                          </span>
                          <span className="text-xs text-gray-500 block">
                            {category.transactions} transaksi • {category.weight.toFixed(1)}kg
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800 text-sm sm:text-base">
                          Rp {category.amount.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs sm:text-sm text-emerald-600 font-medium">
                          {category.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Performing Items */}
            {analyticsData.topItems.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-100 shadow-lg">
                <h4 className="font-semibold text-gray-800 mb-4 text-sm sm:text-base flex items-center">
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  Top 5 Item Terlaris
                </h4>
                <div className="space-y-3">
                  {analyticsData.topItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center min-w-0">
                        <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full mr-3 flex-shrink-0">
                          <span className="text-sm font-bold text-yellow-700">#{index + 1}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{item.name}</p>
                          <p className="text-xs text-gray-600">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-yellow-600 text-sm sm:text-base">
                          Rp {item.earnings.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-gray-600">{item.weight.toFixed(1)} kg</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly Performance Chart Data */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-100 shadow-lg">
              <h4 className="font-semibold text-gray-800 mb-4 text-sm sm:text-base flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
                Performa 6 Bulan Terakhir
              </h4>
              {analyticsData.monthlyEarnings.every(m => m.earnings === 0) ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Belum ada data performa bulanan</p>
                  <p className="text-gray-400 text-xs">Mulai jual sampah untuk melihat tren performa</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analyticsData.monthlyEarnings.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <span className="font-medium text-gray-800 text-sm">{month.month}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600 text-sm">
                          Rp {month.earnings.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-gray-600">{month.transactions} transaksi</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Environmental Impact Analytics */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-100 shadow-lg">
              <h4 className="font-semibold text-gray-800 mb-4 text-sm sm:text-base flex items-center">
                <Leaf className="h-4 w-4 mr-2 text-green-600" />
                Dampak Lingkungan Anda
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <Recycle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-green-600">{stats.co2Reduced.toFixed(1)} kg</p>
                  <p className="text-xs text-gray-600">CO₂ Dikurangi</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-blue-600">{stats.treesSaved}</p>
                  <p className="text-xs text-gray-600">Pohon Diselamatkan</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                  <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-purple-600">{stats.totalWeight.toFixed(1)} kg</p>
                  <p className="text-xs text-gray-600">Total Sampah Didaur Ulang</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sell Tab - Keep existing functionality */}
        {activeTab === 'sell' && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-100 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center mb-3 sm:mb-0">
                  <Calculator className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                  Kalkulator Sampah
                </h3>
                <div className="text-right">
                  <p className="text-gray-600 text-sm">Estimasi Total</p>
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-600">
                    Rp {calculateTotal().toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari item sampah..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 sm:pl-10 pr-4 py-2 placeholder:text-gray-500 text-black border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
                    />
                  </div>
                </div>
                
                <div className="flex-1">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 placeholder:text-gray-500 text-black border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
                  >
                    <option value="all">Semua Kategori</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected Items Summary */}
              {Object.keys(selectedItems).length > 0 && (
                <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-800 text-base sm:text-lg mb-2 sm:mb-0">Keranjang Sampah</h4>
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-gray-600">Total Items: {Object.keys(selectedItems).length}</p>
                      <p className="text-sm text-gray-600">
                        Total Berat: {Object.entries(selectedItems).reduce((sum, [, weight]) => sum + weight, 0).toFixed(1)} kg
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4 sm:mb-6 max-h-64 overflow-y-auto">
                    {Object.entries(selectedItems).map(([itemId, weight]) => {
                      const item = wasteItems.find(w => w.id === itemId)
                      if (!item) return null
                      
                      return (
                        <div key={itemId} className="flex items-center justify-between bg-white p-3 sm:p-4 rounded-xl shadow-sm">
                          <div className="flex items-center min-w-0">
                            <div className="p-2 bg-emerald-100 rounded-lg mr-3 flex-shrink-0">
                              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{item.name}</p>
                              <p className="text-xs sm:text-sm text-gray-600">{item.category.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="text-center">
                              <p className="text-xs sm:text-sm text-gray-600">Berat</p>
                              <p className="font-semibold text-sm sm:text-base placeholder:text-gray-500 text-black">{weight} {item.unit}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs sm:text-sm text-gray-600">Subtotal</p>
                              <p className="font-bold text-emerald-600 text-sm sm:text-base">
                                Rp {(item.price * weight).toLocaleString('id-ID')}
                              </p>
                            </div>
                            <button
                              onClick={() => handleWeightChange(itemId, 0)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white rounded-xl border-2 border-emerald-200 mb-4">
                    <div className="mb-2 sm:mb-0">
                      <p className="text-base sm:text-lg font-bold text-gray-800">Total Estimasi</p>
                      <p className="text-xs sm:text-sm text-gray-600">Akan ditinjau oleh admin</p>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-emerald-600">
                      Rp {calculateTotal().toLocaleString('id-ID')}
                    </p>
                  </div>
                  
                  <button
                    onClick={submitTransaction}
                    disabled={isCalculating || Object.keys(selectedItems).length === 0}
                    className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-base sm:text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:from-emerald-600 hover:to-teal-600"
                  >
                    {isCalculating ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="animate-spin h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                        Memproses Transaksi...
                      </div>
                    ) : (
                      'Submit Transaksi'
                    )}
                  </button>
                </div>
              )}

              {/* Waste Items Grid */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-4 text-sm sm:text-base">Pilih Item Sampah</h4>
                {filteredWasteItems.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Search className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-sm sm:text-base">Tidak ada item yang ditemukan</p>
                    <p className="text-gray-500 text-xs sm:text-sm">Coba ubah kata kunci atau filter kategori</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredWasteItems.map((item) => (
                      <div key={item.id} className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center mb-2">
                              <div className="p-2 bg-gray-100 rounded-lg mr-3 flex-shrink-0">
                                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-gray-800 text-sm sm:text-base truncate">{item.name}</h4>
                                <p className="text-xs sm:text-sm text-gray-600">{item.category.name}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-600 text-sm sm:text-lg">
                              Rp {item.price.toLocaleString('id-ID')}
                            </p>
                            <p className="text-xs text-gray-500">per {item.unit}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <input
                              type="number"
                              placeholder="0.0"
                              step="0.1"
                              min="0"
                              value={selectedItems[item.id] || ''}
                              onChange={(e) => handleWeightChange(item.id, parseFloat(e.target.value) || 0)}
                              className="flex-1 px-3 py-2 placeholder:text-gray-500 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
                            />
                            <span className="text-sm text-gray-600 font-medium">{item.unit}</span>
                          </div>
                          
                          {selectedItems[item.id] && (
                            <div className="p-3 bg-emerald-50 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Subtotal:</span>
                                <span className="font-bold text-emerald-600 text-sm sm:text-base">
                                  Rp {(item.price * selectedItems[item.id]).toLocaleString('id-ID')}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* History Tab - Keep existing functionality */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-100 shadow-lg">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
                  <History className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                  Riwayat Transaksi
                </h3>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari transaksi..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 sm:pl-10 pr-4 py-2 placeholder:text-gray-500 text-black border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:w-auto text-sm sm:text-base"
                    />
                  </div>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 placeholder:text-gray-500 text-black border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
                  >
                    <option value="date">Urutkan: Tanggal</option>
                    <option value="amount">Urutkan: Jumlah</option>
                    <option value="weight">Urutkan: Berat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="text-center p-3 sm:p-4 bg-green-50 rounded-xl">
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.completedTransactions}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Selesai</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-xl">
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.approvedTransactions}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Disetujui</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-xl">
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pendingTransactions}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-red-50 rounded-xl">
                  <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.rejectedTransactions}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Ditolak</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-100 shadow-lg">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <Package className="h-16 w-16 sm:h-20 sm:w-20 text-gray-300 mx-auto mb-4 sm:mb-6" />
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
                    {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum Ada Transaksi'}
                  </h4>
                  <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
                    {searchTerm 
                      ? 'Coba ubah kata kunci pencarian Anda'
                      : 'Mulai jual sampah untuk melihat riwayat di sini'
                    }
                  </p>
                  {!searchTerm && (
                    <button 
                      onClick={() => setActiveTab('sell')}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 text-sm sm:text-base"
                    >
                      Mulai Jual Sampah
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 sm:mb-6">
                        <div className="flex items-center mb-4 sm:mb-0">
                          <div className="p-2 sm:p-3 bg-emerald-100 rounded-xl mr-3 sm:mr-4 flex-shrink-0">
                            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-800 text-base sm:text-lg">
                              Transaksi #{transaction.id.slice(-8).toUpperCase()}
                            </h4>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1">
                              <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                {new Date(transaction.createdAt).toLocaleDateString('id-ID', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                {new Date(transaction.createdAt).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-left sm:text-right">
                          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-2">
                            Rp {transaction.totalAmount.toLocaleString('id-ID')}
                          </p>
                          <div className="flex sm:justify-end">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(transaction.status)}`}>
                              {getStatusLabel(transaction.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-100 pt-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                          <h5 className="font-semibold text-gray-800 text-sm sm:text-base mb-1 sm:mb-0">Detail Items</h5>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Total Berat: <span className="font-semibold">{transaction.totalWeight} kg</span>
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          {transaction.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center min-w-0">
                                <div className="p-2 bg-white rounded-lg mr-3 shadow-sm flex-shrink-0">
                                  <Recycle className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{item.wasteItem.name}</p>
                                  <p className="text-xs sm:text-sm text-gray-600">{item.wasteItem.category.name}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-800 text-sm sm:text-base">
                                  {item.weight} kg
                                </p>
                                <p className="text-xs sm:text-sm font-bold text-emerald-600">
                                  Rp {item.subtotal.toLocaleString('id-ID')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Achievements Tab - Enhanced with Real Data */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-100 shadow-lg">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
                <Award className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                Pencapaian & Badge
              </h3>
              
              {/* Achievement Stats with Real Data */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="text-center p-4 sm:p-6 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-2xl">
                  <Award className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3" />
                  <p className="text-xl sm:text-2xl font-bold mb-1">
                    {Math.floor(stats.totalWeight / 10) + Math.floor(stats.completedTransactions / 5)}
                  </p>
                  <p className="text-xs sm:text-sm opacity-90">Badge Diraih</p>
                  <p className="text-xs opacity-75 mt-1">
                    Berdasarkan {stats.totalWeight.toFixed(1)}kg & {stats.completedTransactions} transaksi
                  </p>
                </div>
                
                <div className="text-center p-4 sm:p-6 bg-gradient-to-r from-emerald-400 to-teal-400 text-white rounded-2xl">
                  <Star className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3" />
                  <p className="text-xl sm:text-2xl font-bold mb-1">{Math.floor(stats.totalWeight * 10)}</p>
                  <p className="text-xs sm:text-sm opacity-90">Poin Lingkungan</p>
                  <p className="text-xs opacity-75 mt-1">
                    {stats.co2Reduced.toFixed(1)}kg CO₂ dikurangi
                  </p>
                </div>
                
                <div className="text-center p-4 sm:p-6 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-2xl">
                  <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3" />
                  <p className="text-xl sm:text-2xl font-bold mb-1">
                    {stats.completedTransactions >= 10 ? 'Expert' : 
                     stats.completedTransactions >= 5 ? 'Aktif' : 
                     stats.completedTransactions > 0 ? 'Pemula' : 'Baru'}
                  </p>
                  <p className="text-xs sm:text-sm opacity-90">Status Member</p>
                  <p className="text-xs opacity-75 mt-1">
                    {stats.successRate.toFixed(1)}% success rate
                  </p>
                </div>
              </div>

              {/* Achievements List with Real Progress */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 mb-4 text-sm sm:text-base">Badge yang Diraih</h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {[
                    {
                      title: "First Step",
                      description: "Transaksi pertama berhasil",
                      achieved: stats.totalTransactions > 0,
                      progress: Math.min(stats.totalTransactions, 1),
                      target: 1,
                      icon: Package,
                      color: "emerald"
                    },
                    {
                      title: "Eco Warrior",
                      description: "Jual 10+ kg sampah",
                      achieved: stats.totalWeight >= 10,
                      progress: Math.min(stats.totalWeight, 10),
                      target: 10,
                      icon: Leaf,
                      color: "green"
                    },
                    {
                      title: "Consistent Seller",
                      description: "5+ transaksi selesai",
                      achieved: stats.completedTransactions >= 5,
                      progress: Math.min(stats.completedTransactions, 5),
                      target: 5,
                      icon: TrendingUp,
                      color: "blue"
                    },
                    {
                      title: "Big Contributor",
                      description: "Earning Rp 100.000+",
                      achieved: stats.totalBalance >= 100000,
                      progress: Math.min(stats.totalBalance, 100000),
                      target: 100000,
                      icon: Star,
                      color: "yellow"
                    },
                    {
                      title: "Environmental Hero",
                      description: "50+ kg sampah didaur ulang",
                      achieved: stats.totalWeight >= 50,
                      progress: Math.min(stats.totalWeight, 50),
                      target: 50,
                      icon: Recycle,
                      color: "teal"
                    },
                    {
                      title: "Master Seller",
                      description: "20+ transaksi selesai",
                      achieved: stats.completedTransactions >= 20,
                      progress: Math.min(stats.completedTransactions, 20),
                      target: 20,
                      icon: Award,
                      color: "purple"
                    }
                  ].map((achievement, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        achievement.achieved 
                          ? `bg-${achievement.color}-50 border-${achievement.color}-200 shadow-sm` 
                          : 'bg-gray-50 border-gray-200 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className={`p-2 sm:p-3 rounded-xl mr-3 sm:mr-4 ${
                            achievement.achieved 
                              ? `bg-${achievement.color}-100` 
                              : 'bg-gray-100'
                          }`}>
                            <achievement.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${
                              achievement.achieved 
                                ? `text-${achievement.color}-600` 
                                : 'text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-gray-800 text-sm sm:text-base">{achievement.title}</h5>
                            <p className="text-xs sm:text-sm text-gray-600">{achievement.description}</p>
                          </div>
                        </div>
                        {achievement.achieved && (
                          <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      
                      {/* Progress Bar for Unachieved Badges */}
                      {!achievement.achieved && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>
                              {achievement.target === 100000 
                                ? `Rp ${Math.round(achievement.progress).toLocaleString('id-ID')} / Rp ${achievement.target.toLocaleString('id-ID')}`
                                : `${achievement.progress.toFixed(achievement.target < 10 ? 1 : 0)} / ${achievement.target}`
                              }
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Enhanced Progress Section with Real Data */}
              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                <h4 className="font-bold text-gray-800 mb-4 text-sm sm:text-base">Progress Menuju Badge Berikutnya</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs sm:text-sm text-gray-600">Expert Seller (50 transaksi total)</span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-800">
                        {stats.totalTransactions}/50
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min((stats.totalTransactions / 50) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs sm:text-sm text-gray-600">Environmental Champion (100 kg total)</span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-800">
                        {stats.totalWeight.toFixed(1)}/100 kg
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min((stats.totalWeight / 100) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs sm:text-sm text-gray-600">Millionaire Club (Rp 1.000.000 total)</span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-800">
                        Rp {stats.totalBalance.toLocaleString('id-ID')} / Rp 1.000.000
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min((stats.totalBalance / 1000000) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Achievement Summary */}
                <div className="mt-6 p-4 bg-white rounded-xl border border-emerald-200">
                  <h5 className="font-semibold text-gray-800 mb-3 text-sm">Ringkasan Pencapaian</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-emerald-600">{stats.totalTransactions}</p>
                      <p className="text-xs text-gray-600">Total Transaksi</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-600">{stats.totalWeight.toFixed(1)}kg</p>
                      <p className="text-xs text-gray-600">Sampah Didaur Ulang</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{stats.co2Reduced.toFixed(1)}kg</p>
                      <p className="text-xs text-gray-600">CO₂ Dikurangi</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-purple-600">{stats.successRate.toFixed(1)}%</p>
                      <p className="text-xs text-gray-600">Success Rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add custom scrollbar hide utility */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
