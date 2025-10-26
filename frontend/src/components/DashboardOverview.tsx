import React from 'react'
import { Users, DollarSign, Wifi, TrendingUp, Activity, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency } from '../utils/formatters'
import { useNavigate } from 'react-router-dom'
import type { DashboardStats } from '../types'

interface DashboardOverviewProps {
  stats: DashboardStats | null
  onRefresh?: () => void
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ stats, onRefresh }) => {
  const navigate = useNavigate()
  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Active Sessions',
      value: stats.activeSessions.toString(),
      icon: Wifi,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: stats.activeSessions > 0 ? 'Live' : 'None',
      changeType: stats.activeSessions > 0 ? 'positive' : 'neutral'
    },
    {
      title: 'Today\'s Revenue',
      value: formatCurrency(stats.todayRevenue),
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: 'Today',
      changeType: 'neutral'
    }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Monitor your WiFi billing system performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 h-32 flex items-center hover:shadow-md transition-shadow">
            <div className="flex items-center w-full">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 truncate">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 truncate">{stat.value}</p>
                <div className="flex items-center mt-1">
                  <span className={`text-xs font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 
                    stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/admin/users')}
              className="w-full text-left p-3 sm:p-4 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">Manage Users</p>
                  <p className="text-sm text-gray-600 hidden sm:block">View and manage customer accounts</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
              </div>
            </button>
            <button 
              onClick={() => navigate('/admin/plans')}
              className="w-full text-left p-3 sm:p-4 rounded-xl border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200 group"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">Create New Plan</p>
                  <p className="text-sm text-gray-600 hidden sm:block">Add new internet packages</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors flex-shrink-0" />
              </div>
            </button>
            <button 
              onClick={() => navigate('/admin/sessions')}
              className="w-full text-left p-3 sm:p-4 rounded-xl border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 group"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors flex-shrink-0">
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">View Active Sessions</p>
                  <p className="text-sm text-gray-600 hidden sm:block">Monitor current connections</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors flex-shrink-0" />
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
            <button 
              onClick={onRefresh}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Refresh
            </button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center min-w-0 flex-1">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse flex-shrink-0"></div>
                <span className="text-sm font-medium text-gray-900 truncate">API Server</span>
              </div>
              <span className="text-sm text-green-700 font-medium flex-shrink-0">Online</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center min-w-0 flex-1">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse flex-shrink-0"></div>
                <span className="text-sm font-medium text-gray-900 truncate">Database</span>
              </div>
              <span className="text-sm text-green-700 font-medium flex-shrink-0">Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center min-w-0 flex-1">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse flex-shrink-0"></div>
                <span className="text-sm font-medium text-gray-900 truncate">M-Pesa Integration</span>
              </div>
              <span className="text-sm text-green-700 font-medium flex-shrink-0">Active (Dev)</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center min-w-0 flex-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3 animate-pulse flex-shrink-0"></div>
                <span className="text-sm font-medium text-gray-900 truncate">Router Connection</span>
              </div>
              <span className="text-sm text-yellow-700 font-medium flex-shrink-0">Checking...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button 
            onClick={() => navigate('/admin/payments')}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center p-3 sm:p-4 bg-gradient-to-r from-green-50 to-transparent rounded-xl border border-green-100">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3 sm:mr-4 animate-pulse flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">New user registered</p>
              <p className="text-xs text-gray-600 truncate">+254712345678 • 2 minutes ago</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-green-500 flex-shrink-0" />
          </div>
          <div className="flex items-center p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-xl border border-blue-100">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 sm:mr-4 animate-pulse flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Payment completed</p>
              <p className="text-xs text-gray-600 truncate">KES 100 • Premium 24 Hours • 5 minutes ago</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-blue-500 flex-shrink-0" />
          </div>
          <div className="flex items-center p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-transparent rounded-xl border border-purple-100">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-3 sm:mr-4 animate-pulse flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Session started</p>
              <p className="text-xs text-gray-600 truncate">User connected to WiFi • 8 minutes ago</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-purple-500 flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview