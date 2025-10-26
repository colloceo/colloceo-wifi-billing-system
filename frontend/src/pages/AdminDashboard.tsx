import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Wifi, 
  Settings, 
  LogOut,
  Menu,
  X,
  DollarSign,
  Activity,
  Clock,
  TrendingUp
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { adminAPI } from '../services/api'
import { formatCurrency } from '../utils/formatters'
import toast from 'react-hot-toast'
import type { DashboardStats } from '../types'

// Dashboard components
import DashboardOverview from '../components/DashboardOverview'
import UsersManagement from '../components/UsersManagement'
import PlansManagement from '../components/PlansManagement'
import SessionsManagement from '../components/SessionsManagement'
import PaymentsManagement from '../components/PaymentsManagement'

const AdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()
  const location = useLocation()

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats()
      if (response.success && response.data) {
        setStats(response.data)
      }
    } catch (error) {
      toast.error('Failed to load dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Plans', href: '/admin/plans', icon: CreditCard },
    { name: 'Sessions', href: '/admin/sessions', icon: Wifi },
    { name: 'Payments', href: '/admin/payments', icon: DollarSign },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <Wifi className="w-8 h-8 text-primary-600 mr-2" />
            <span className="text-xl font-bold text-gray-900">COLLOSPOT</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6">
          <div className="px-6 mb-6">
            <div className="bg-primary-50 rounded-lg p-4">
              <p className="text-sm font-medium text-primary-900">Welcome back!</p>
              <p className="text-xs text-primary-700">{user?.firstName || 'Admin'}</p>
            </div>
          </div>

          <div className="space-y-1 px-3">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/admin' && location.pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-3">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-gray-600"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-4">
              {stats && (
                <div className="hidden md:flex items-center space-x-6 text-sm">
                  <div className="flex items-center text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="font-medium">{formatCurrency(stats.todayRevenue)}</span>
                    <span className="text-gray-500 ml-1">today</span>
                  </div>
                  <div className="flex items-center text-blue-600">
                    <Activity className="w-4 h-4 mr-1" />
                    <span className="font-medium">{stats.activeSessions}</span>
                    <span className="text-gray-500 ml-1">active</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          <Routes>
            <Route path="/" element={<DashboardOverview stats={stats} />} />
            <Route path="/users" element={<UsersManagement />} />
            <Route path="/plans" element={<PlansManagement />} />
            <Route path="/sessions" element={<SessionsManagement />} />
            <Route path="/payments" element={<PaymentsManagement />} />
            <Route path="/settings" element={<div>Settings coming soon...</div>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard