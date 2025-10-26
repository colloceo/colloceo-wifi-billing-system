import React, { useState, useEffect } from 'react'
import { Wifi, StopCircle, Clock, User, Smartphone } from 'lucide-react'
import { adminAPI } from '../services/api'
import { formatDate, formatSessionStatus, formatBytes, formatPhoneNumber } from '../utils/formatters'
import toast from 'react-hot-toast'
import type { Session, PaginatedResponse } from '../types'

const SessionsManagement: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    fetchSessions()
  }, [currentPage, filter])

  const fetchSessions = async () => {
    try {
      const response = await adminAPI.getSessions({
        page: currentPage,
        limit: 20,
        status: filter === 'all' ? undefined : filter
      })
      
      if (response.success && response.data) {
        setSessions(response.data.sessions)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      toast.error('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleTerminateSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to terminate this session?')) return

    try {
      const response = await adminAPI.terminateSession(sessionId)
      if (response.success) {
        toast.success('Session terminated successfully')
        fetchSessions()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to terminate session')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const getStatusCounts = () => {
    const active = sessions.filter(s => s.status === 'ACTIVE').length
    const expired = sessions.filter(s => s.status === 'EXPIRED').length
    const terminated = sessions.filter(s => s.status === 'TERMINATED').length
    return { active, expired, terminated }
  }

  if (loading && sessions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Sessions Management</h1>
        </div>
        <div className="card">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sessions Management</h1>
          <p className="text-gray-600">Monitor and manage user internet sessions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Wifi className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.active}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.expired}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <StopCircle className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Terminated</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.terminated}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Sessions
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'ACTIVE' 
                ? 'bg-green-100 text-green-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('EXPIRED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'EXPIRED' 
                ? 'bg-red-100 text-red-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Expired
          </button>
          <button
            onClick={() => setFilter('TERMINATED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'TERMINATED' 
                ? 'bg-gray-100 text-gray-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Terminated
          </button>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Used
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Connection
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map((session) => {
                const status = formatSessionStatus(session.status)
                const startTime = new Date(session.startTime)
                const endTime = session.endTime ? new Date(session.endTime) : null
                const duration = endTime 
                  ? Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)) 
                  : Math.round((new Date().getTime() - startTime.getTime()) / (1000 * 60))

                return (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {session.user?.firstName && session.user?.lastName 
                              ? `${session.user.firstName} ${session.user.lastName}`
                              : 'Unknown User'
                            }
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatPhoneNumber(session.user?.phone || '')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {session.plan?.name || 'Unknown Plan'}
                      </div>
                      <div className="text-sm text-gray-500">
                        KES {session.plan?.price || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={status.className}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div>Started: {formatDate(session.startTime)}</div>
                        {session.endTime && (
                          <div>Ended: {formatDate(session.endTime)}</div>
                        )}
                        <div className="text-gray-500">
                          Duration: {duration} minutes
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatBytes(Number(session.dataUsed))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        {session.ipAddress && (
                          <div className="flex items-center">
                            <Smartphone className="w-3 h-3 mr-1" />
                            {session.ipAddress}
                          </div>
                        )}
                        {session.macAddress && (
                          <div className="text-xs">
                            MAC: {session.macAddress}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {session.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleTerminateSession(session.id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <StopCircle className="w-4 h-4 mr-1" />
                          Terminate
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {sessions.length === 0 && !loading && (
          <div className="text-center py-12">
            <Wifi className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'Sessions will appear here once users connect to WiFi'
                : `No ${filter.toLowerCase()} sessions found`
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
              const page = i + 1
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    page === pagination.page
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              )
            })}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SessionsManagement