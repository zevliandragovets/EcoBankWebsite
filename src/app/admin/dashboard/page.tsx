"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image";
import Link from "next/link"
import { 
  Users, 
  Recycle, 
  DollarSign, 
  TrendingUp,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Edit,
  Save,
  X,
  RefreshCw,
  Eye,
  Trash2,
  Menu,
  ChevronDown
} from "lucide-react"

interface Transaction {
  id: string
  user: {
    name: string
    email: string
  }
  totalAmount: number
  totalWeight: number
  status: string
  createdAt: string
  items: any[]
}

interface WasteItem {
  id: string
  name: string
  price: number
  unit: string
  category: {
    id: string
    name: string
  }
  isActive: boolean
}

interface Category {
  id: string
  name: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  count?: number
  message?: string
  error?: string
  details?: string
}

interface WasteItemForm {
  name: string
  price: string
  unit: string
  categoryId: string
  isActive: boolean
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [wasteItems, setWasteItems] = useState<WasteItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null)
  const [statusUpdate, setStatusUpdate] = useState({ status: '' })
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Waste Item Management States
  const [showWasteItemModal, setShowWasteItemModal] = useState(false)
  const [editingWasteItem, setEditingWasteItem] = useState<WasteItem | null>(null)
  const [wasteItemForm, setWasteItemForm] = useState<WasteItemForm>({
    name: '',
    price: '',
    unit: '',
    categoryId: '',
    isActive: true
  })
  const [submittingWasteItem, setSubmittingWasteItem] = useState(false)
  const [deletingWasteItem, setDeletingWasteItem] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [transactionsRes, wasteItemsRes] = await Promise.all([
        fetch('/api/transactions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        }),
        fetch('/api/waste-items', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        })
      ])

      // Handle transactions response
      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json()
        
        if (Array.isArray(transactionsData)) {
          setTransactions(transactionsData)
        } else if (transactionsData.success && Array.isArray(transactionsData.data)) {
          setTransactions(transactionsData.data)
        } else {
          console.error('Invalid transactions response format:', transactionsData)
          setError(`Invalid transactions response: ${transactionsData.error || 'Unknown format'}`)
          setTransactions([])
        }
      } else {
        const errorData = await transactionsRes.json()
        throw new Error(`Transactions (${transactionsRes.status}): ${errorData.error || transactionsRes.statusText}`)
      }

      // Handle waste items response
      if (wasteItemsRes.ok) {
        const wasteItemsData: ApiResponse<WasteItem[]> = await wasteItemsRes.json()
        
        if (wasteItemsData.success && Array.isArray(wasteItemsData.data)) {
          setWasteItems(wasteItemsData.data)
          
          // Extract unique categories from waste items
          const uniqueCategories = wasteItemsData.data.reduce((acc: Category[], item) => {
            const existingCategory = acc.find(cat => cat.id === item.category.id)
            if (!existingCategory) {
              acc.push({
                id: item.category.id,
                name: item.category.name
              })
            }
            return acc
          }, [])
          setCategories(uniqueCategories)
        } else {
          console.error('Invalid waste items response format:', wasteItemsData)
          setError(`Invalid waste items response: ${wasteItemsData.error || 'Unknown format'}`)
          setWasteItems([])
        }
      } else {
        const errorData = await wasteItemsRes.json()
        throw new Error(`Waste Items (${wasteItemsRes.status}): ${errorData.error || wasteItemsRes.statusText}`)
      }

    } catch (error) {
      console.error('Error fetching data:', error)
      setError(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setTransactions([])
      setWasteItems([])
    } finally {
      setLoading(false)
    }
  }

  // Waste Item Management Functions
  const openWasteItemModal = (item?: WasteItem) => {
    if (item) {
      setEditingWasteItem(item)
      setWasteItemForm({
        name: item.name,
        price: item.price.toString(),
        unit: item.unit,
        categoryId: item.category.id,
        isActive: item.isActive
      })
    } else {
      setEditingWasteItem(null)
      setWasteItemForm({
        name: '',
        price: '',
        unit: '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        isActive: true
      })
    }
    setShowWasteItemModal(true)
  }

  const closeWasteItemModal = () => {
    setShowWasteItemModal(false)
    setEditingWasteItem(null)
    setWasteItemForm({
      name: '',
      price: '',
      unit: '',
      categoryId: '',
      isActive: true
    })
    setError(null)
  }

  const handleWasteItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingWasteItem(true)
    setError(null)

    try {
      const url = editingWasteItem 
        ? `/api/waste-items/${editingWasteItem.id}`
        : '/api/waste-items'
      
      const method = editingWasteItem ? 'PUT' : 'POST'
      
      const requestData: any = {
        name: wasteItemForm.name.trim(),
        price: parseFloat(wasteItemForm.price),
        unit: wasteItemForm.unit.trim(),
        categoryId: wasteItemForm.categoryId,
        isActive: wasteItemForm.isActive
      }

      if (editingWasteItem) {
        requestData.id = editingWasteItem.id
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save waste item')
      }

      if (data.success) {
        // Refresh the data
        await fetchData()
        closeWasteItemModal()
        
        // Show success message
        alert(data.message || (editingWasteItem ? 'Item berhasil diperbarui' : 'Item berhasil ditambahkan'))
      } else {
        throw new Error(data.error || 'Failed to save waste item')
      }
    } catch (error) {
      console.error('Error saving waste item:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save waste item'
      setError(errorMessage)
    } finally {
      setSubmittingWasteItem(false)
    }
  }

  const handleDeleteWasteItem = async (item: WasteItem) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${item.name}"?\n\nJika item ini pernah digunakan dalam transaksi, item akan dinonaktifkan. Jika belum pernah digunakan, item akan dihapus permanen.`)) {
      return
    }

    setDeletingWasteItem(item.id)
    setError(null)

    try {
      const response = await fetch(`/api/waste-items/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete waste item')
      }

      if (data.success) {
        // Refresh the data
        await fetchData()
        alert(data.message || 'Item berhasil dihapus')
      } else {
        throw new Error(data.error || 'Failed to delete waste item')
      }
    } catch (error) {
      console.error('Error deleting waste item:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete waste item'
      setError(errorMessage)
      alert(`Gagal menghapus item: ${errorMessage}`)
    } finally {
      setDeletingWasteItem(null)
    }
  }

  const updateTransactionStatus = async (transactionId: string, status: string) => {
    console.log('Updating transaction:', { transactionId, status })
    
    setUpdatingStatus(transactionId)
    setError(null)
    
    try {
      const requestBody = { status }
      console.log('Request body:', requestBody)
      
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      let data
      try {
        data = await response.json()
        console.log('Response data:', data)
      } catch (jsonError) {
        console.error('Failed to parse response JSON:', jsonError)
        throw new Error('Server returned invalid JSON response')
      }

      if (!response.ok) {
        const errorMessage = data?.error || `HTTP ${response.status}: ${response.statusText}`
        const errorDetails = data?.details ? ` (${data.details})` : ''
        throw new Error(`${errorMessage}${errorDetails}`)
      }

      if (data.success) {
        setTransactions(prevTransactions =>
          prevTransactions.map(transaction =>
            transaction.id === transactionId
              ? { ...transaction, status }
              : transaction
          )
        )
        
        setEditingTransaction(null)
        setStatusUpdate({ status: '' })
        
        console.log('Status updated successfully')
        alert(data.message || 'Status berhasil diperbarui')
      } else {
        throw new Error(data.error || 'Update failed but no error message provided')
      }
    } catch (error) {
      console.error('Error updating transaction status:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update status'
      setError(`Update failed: ${errorMessage}`)
      
      alert(`Gagal memperbarui status: ${errorMessage}`)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleStatusEdit = (transaction: Transaction) => {
    console.log('Starting edit for transaction:', transaction.id)
    setEditingTransaction(transaction.id)
    setStatusUpdate({
      status: transaction.status
    })
  }

  const handleStatusSave = (transactionId: string) => {
    console.log('Saving status for transaction:', transactionId, statusUpdate)
    
    if (!statusUpdate.status) {
      alert('Status harus dipilih')
      return
    }
    
    const currentTransaction = transactions.find(t => t.id === transactionId)
    if (currentTransaction && currentTransaction.status === statusUpdate.status) {
      alert('Tidak ada perubahan yang dilakukan')
      setEditingTransaction(null)
      return
    }
    
    updateTransactionStatus(transactionId, statusUpdate.status)
  }

  const handleStatusCancel = () => {
    console.log('Canceling status edit')
    setEditingTransaction(null)
    setStatusUpdate({ status: '' })
  }

  const getAvailableStatuses = (currentStatus: string) => {
    const statusTransitions: { [key: string]: { value: string, label: string }[] } = {
      'PENDING': [
        { value: 'APPROVED', label: 'Disetujui' },
        { value: 'REJECTED', label: 'Ditolak' }
      ],
      'APPROVED': [
        { value: 'COMPLETED', label: 'Selesai' },
        { value: 'REJECTED', label: 'Ditolak' }
      ],
      'REJECTED': [],
      'COMPLETED': []
    }
    
    return statusTransitions[currentStatus] || []
  }

  const stats = {
    totalTransactions: Array.isArray(transactions) ? transactions.length : 0,
    totalRevenue: Array.isArray(transactions) 
      ? transactions.reduce((sum, t) => sum + t.totalAmount, 0) 
      : 0,
    totalWeight: Array.isArray(transactions) 
      ? transactions.reduce((sum, t) => sum + t.totalWeight, 0) 
      : 0,
    activeWasteItems: Array.isArray(wasteItems) 
      ? wasteItems.filter(item => item.isActive).length 
      : 0
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-green-600 bg-green-100'
      case 'PENDING': return 'text-yellow-600 bg-yellow-100'
      case 'COMPLETED': return 'text-blue-600 bg-blue-100'
      case 'REJECTED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      case 'REJECTED': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-emerald-700 font-medium text-sm sm:text-base">Memuat dashboard admin...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-emerald-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-1">
              <Image src="/logo.png" alt="Logo Rumah Bank Sampah" width={48} height={48} className="sm:w-12 sm:h-12" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">RUMAH BANK SAMPAH PKS TERANTAM Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Kelola sampah, raih keuntungan</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right hidden lg:block">
                <p className="text-sm text-gray-600">Halo, {session?.user?.name}</p>
                <p className="text-xs text-emerald-600 font-medium">
                  {session?.user?.role === 'ADMIN' ? 'Admin' : 'Member Aktif'}
                </p>
              </div>
              <button
                onClick={fetchData}
                className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <Link 
                href="/"
                className="px-3 py-2 sm:px-4 text-emerald-600 font-medium border border-emerald-200 rounded-lg transition-colors hover:bg-emerald-50 text-sm hidden sm:block"
              >
                Home
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 pt-3 border-t border-emerald-200">
              <div className="flex flex-col space-y-2">
                <span className="text-gray-600 text-sm px-2">
                  Selamat datang, {session?.user?.name}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={fetchData}
                    className="flex items-center px-3 py-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors text-sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </button>
                  <Link 
                    href="/"
                    className="flex items-center px-3 py-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-medium transition-colors text-sm"
                  >
                    Kembali ke Home
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-red-800 font-medium text-sm sm:text-base">Error</p>
                <p className="text-red-700 text-xs sm:text-sm mt-1 break-words">{error}</p>
                <div className="mt-2 sm:mt-3 flex space-x-3">
                  <button 
                    onClick={() => setError(null)}
                    className="text-xs sm:text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Dismiss
                  </button>
                  <button 
                    onClick={fetchData}
                    className="text-xs sm:text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-6 sm:mb-8">
          {/* Desktop Tabs */}
          <div className="hidden sm:flex space-x-1 bg-white/60 backdrop-blur-sm p-1 rounded-xl border border-emerald-200">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'transactions', label: 'Transaksi', icon: DollarSign },
              { id: 'waste-items', label: 'Kelola Sampah', icon: Package }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 lg:px-6 py-3 rounded-lg font-medium transition-all text-sm lg:text-base ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <tab.icon className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Mobile Dropdown */}
          <div className="sm:hidden relative">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/60 backdrop-blur-sm rounded-xl border border-emerald-200 text-gray-700"
            >
              <div className="flex items-center">
                {activeTab === 'overview' && <TrendingUp className="mr-2 h-4 w-4" />}
                {activeTab === 'transactions' && <DollarSign className="mr-2 h-4 w-4" />}
                {activeTab === 'waste-items' && <Package className="mr-2 h-4 w-4" />}
                <span className="font-medium">
                  {activeTab === 'overview' && 'Overview'}
                  {activeTab === 'transactions' && 'Transaksi'}
                  {activeTab === 'waste-items' && 'Kelola Sampah'}
                </span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>

            {mobileMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-emerald-200 shadow-lg z-10">
                {[
                  { id: 'overview', label: 'Overview', icon: TrendingUp },
                  { id: 'transactions', label: 'Transaksi', icon: DollarSign },
                  { id: 'waste-items', label: 'Kelola Sampah', icon: Package }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                      activeTab === tab.id ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                    }`}
                  >
                    <tab.icon className="mr-3 h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-emerald-200 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm">Total Transaksi</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.totalTransactions}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-emerald-200 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1 mr-2">
                    <p className="text-gray-600 text-xs sm:text-sm">Total Pendapatan</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-800 truncate">
                      Rp {stats.totalRevenue.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex-shrink-0">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-emerald-200 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm">Total Berat Sampah</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                      {stats.totalWeight.toFixed(1)} Kg
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl">
                    <Recycle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-emerald-200 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm">Jenis Sampah Aktif</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.activeWasteItems}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl">
                    <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-emerald-200 shadow-lg">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">Transaksi Terbaru</h3>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm sm:text-base">Belum ada transaksi</p>
                </div>
              ) : (
                <>
                  {/* Mobile Card Layout */}
                  <div className="space-y-3 sm:hidden">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex justify-between items-start mb-2">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-800 text-sm truncate">{transaction.user.name}</div>
                            <div className="text-xs text-gray-600 truncate">{transaction.user.email}</div>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            <span className="ml-1">{getStatusLabel(transaction.status)}</span>
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Total:</span>
                            <div className="font-semibold text-gray-800">Rp {transaction.totalAmount.toLocaleString('id-ID')}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Berat:</span>
                            <div className="text-gray-600">{transaction.totalWeight} Kg</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Tanggal:</span>
                            <div className="text-gray-600">{new Date(transaction.createdAt).toLocaleDateString('id-ID')}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table Layout */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Berat</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Tanggal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.slice(0, 5).map((transaction) => (
                          <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium text-gray-800">{transaction.user.name}</div>
                                <div className="text-sm text-gray-600">{transaction.user.email}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-semibold text-gray-800">
                              Rp {transaction.totalAmount.toLocaleString('id-ID')}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {transaction.totalWeight} Kg
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                                {getStatusIcon(transaction.status)}
                                <span className="ml-1">{getStatusLabel(transaction.status)}</span>
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {new Date(transaction.createdAt).toLocaleDateString('id-ID')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-emerald-200 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">Semua Transaksi</h3>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                  <input
                    type="text"
                    placeholder="Cari transaksi..."
                    className="pl-8 sm:pl-10 pr-4 py-2 placeholder:text-gray-500 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto text-sm"
                  />
                </div>
                <button className="flex items-center justify-center px-4 py-2 text-emerald-600 border border-emerald-300 rounded-lg hover:bg-emerald-50 text-sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </button>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <Package className="h-16 w-16 sm:h-20 sm:w-20 text-gray-300 mx-auto mb-4 sm:mb-6" />
                <h4 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">Belum Ada Transaksi</h4>
                <p className="text-gray-500 text-sm sm:text-base">Transaksi akan muncul di sini setelah user mulai menjual sampah</p>
              </div>
            ) : (
              <>
                {/* Mobile Card Layout */}
                <div className="space-y-4 sm:hidden">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="bg-gray-50 rounded-lg p-4 border">
                      <div className="flex justify-between items-start mb-3">
                        <div className="min-w-0 flex-1 mr-3">
                          <div className="text-xs text-gray-500 mb-1">#{transaction.id.slice(-8)}</div>
                          <div className="font-medium text-gray-800 text-sm truncate">{transaction.user.name}</div>
                          <div className="text-xs text-gray-600 truncate">{transaction.user.email}</div>
                        </div>
                        {editingTransaction === transaction.id ? (
                          <select
                            value={statusUpdate.status}
                            onChange={(e) => setStatusUpdate({ status: e.target.value })}
                            className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value={transaction.status}>
                              {getStatusLabel(transaction.status)} (Current)
                            </option>
                            {getAvailableStatuses(transaction.status).map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            <span className="ml-1">{getStatusLabel(transaction.status)}</span>
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                        <div>
                          <span className="text-gray-500">Items:</span>
                          <div className="text-gray-600">{transaction.items.length} items</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Total:</span>
                          <div className="font-semibold text-gray-800">Rp {transaction.totalAmount.toLocaleString('id-ID')}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Tanggal:</span>
                          <div className="text-gray-600">{new Date(transaction.createdAt).toLocaleDateString('id-ID')}</div>
                        </div>
                      </div>

                      {/* Mobile Action Buttons */}
                      {editingTransaction === transaction.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusSave(transaction.id)}
                            disabled={updatingStatus === transaction.id}
                            className="flex-1 flex items-center justify-center px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingStatus === transaction.id ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <Save className="h-3 w-3 mr-1" />
                            )}
                            Simpan
                          </button>
                          <button
                            onClick={handleStatusCancel}
                            disabled={updatingStatus === transaction.id}
                            className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-xs disabled:opacity-50"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Batal
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusEdit(transaction)}
                            disabled={getAvailableStatuses(transaction.status).length === 0}
                            className="flex-1 flex items-center justify-center px-3 py-2 text-emerald-600 border border-emerald-300 rounded-lg hover:bg-emerald-50 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Tanggal</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="py-3 px-4 text-sm text-gray-600">
                            #{transaction.id.slice(-8)}
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-800">{transaction.user.name}</div>
                              <div className="text-sm text-gray-600">{transaction.user.email}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {transaction.items.length} items
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-800">
                            Rp {transaction.totalAmount.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-4">
                            {editingTransaction === transaction.id ? (
                              <select
                                value={statusUpdate.status}
                                onChange={(e) => setStatusUpdate({ status: e.target.value })}
                                className="w-full px-3 py-1 placeholder:text-gray-500 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                              >
                                <option value={transaction.status}>
                                  {getStatusLabel(transaction.status)} (Current)
                                </option>
                                {getAvailableStatuses(transaction.status).map((status) => (
                                  <option key={status.value} value={status.value}>
                                    {status.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                                {getStatusIcon(transaction.status)}
                                <span className="ml-1">{getStatusLabel(transaction.status)}</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(transaction.createdAt).toLocaleDateString('id-ID')}
                          </td>
                          <td className="py-3 px-4">
                            {editingTransaction === transaction.id ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleStatusSave(transaction.id)}
                                  disabled={updatingStatus === transaction.id}
                                  className="flex items-center px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {updatingStatus === transaction.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                  ) : (
                                    <Save className="h-4 w-4 mr-1" />
                                  )}
                                  Simpan
                                </button>
                                <button
                                  onClick={handleStatusCancel}
                                  disabled={updatingStatus === transaction.id}
                                  className="flex items-center px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm disabled:opacity-50"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleStatusEdit(transaction)}
                                  disabled={getAvailableStatuses(transaction.status).length === 0}
                                  className="flex items-center px-3 py-1 text-emerald-600 border border-emerald-300 rounded-lg hover:bg-emerald-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                  title={getAvailableStatuses(transaction.status).length === 0 ? 'Tidak ada status yang dapat diubah' : 'Edit status transaksi'}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Waste Items Tab */}
        {activeTab === 'waste-items' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-emerald-200 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">Kelola Jenis Sampah</h3>
              <button 
                onClick={() => openWasteItemModal()}
                className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 text-sm sm:text-base"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Item
              </button>
            </div>

            {wasteItems.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <Package className="h-16 w-16 sm:h-20 sm:w-20 text-gray-300 mx-auto mb-4 sm:mb-6" />
                <h4 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">Belum Ada Item Sampah</h4>
                <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">Tambahkan jenis sampah untuk memulai sistem</p>
                <button 
                  onClick={() => openWasteItemModal()}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200"
                >
                  Tambah Item Pertama
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {wasteItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="min-w-0 flex-1 mr-2">
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{item.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">{item.category.name}</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${item.isActive ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                    </div>
                    <div className="space-y-2 mb-3 sm:mb-4">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Harga:</span>
                        <span className="font-semibold text-emerald-600 truncate ml-2">
                          Rp {item.price.toLocaleString('id-ID')}/{item.unit}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${item.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                          {item.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openWasteItemModal(item)}
                        className="flex-1 px-3 py-2 text-emerald-600 border border-emerald-300 rounded-lg hover:bg-emerald-50 text-xs sm:text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteWasteItem(item)}
                        disabled={deletingWasteItem === item.id}
                        className="flex-1 px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingWasteItem === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        ) : (
                          'Hapus'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Waste Item Modal */}
      {showWasteItemModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                  {editingWasteItem ? 'Edit Item Sampah' : 'Tambah Item Sampah'}
                </h3>
                <button
                  onClick={closeWasteItemModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleWasteItemSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Item *
                  </label>
                  <input
                    type="text"
                    required
                    value={wasteItemForm.name}
                    onChange={(e) => setWasteItemForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 placeholder:text-gray-500 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    placeholder="Contoh: Botol Plastik"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga per Unit *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={wasteItemForm.price}
                    onChange={(e) => setWasteItemForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 placeholder:text-gray-500 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Satuan *
                  </label>
                  <input
                    type="text"
                    required
                    value={wasteItemForm.unit}
                    onChange={(e) => setWasteItemForm(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-3 py-2 placeholder:text-gray-500 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    placeholder="Contoh: kg, pcs, liter"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <select
                    required
                    value={wasteItemForm.categoryId}
                    onChange={(e) => setWasteItemForm(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-3 py-2 placeholder:text-gray-500 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={wasteItemForm.isActive}
                      onChange={(e) => setWasteItemForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Item Aktif</span>
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeWasteItemModal}
                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingWasteItem}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {submittingWasteItem ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {editingWasteItem ? 'Memperbarui...' : 'Menambahkan...'}
                      </div>
                    ) : (
                      editingWasteItem ? 'Perbarui' : 'Tambah'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
