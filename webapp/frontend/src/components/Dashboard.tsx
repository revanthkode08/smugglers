import React, { useEffect, useState } from 'react'
import { useDashboardStore } from '../store/dashboardStore'
import { apiService } from '../services/api'
import MapComponent from './Map'
import { Header } from './Header'
import { StatsCard } from './StatsCard'
import { EventTable } from './EventTable'
import { StatusChart, ConfidenceChart, TimeSeriesChart, RegionChart } from './Charts'
import { FilterPanel } from './Filters'
import { EventDetail } from './EventDetail'
import { DetectionUpload } from './DetectionUpload'
import { Users, TrendingUp, Target, AlertTriangle, Upload } from 'lucide-react'

export const Dashboard: React.FC = () => {
  const events = useDashboardStore((s) => s.events)
  const setEvents = useDashboardStore((s) => s.setEvents)
  const setLoading = useDashboardStore((s) => s.setLoading)
  const loading = useDashboardStore((s) => s.loading)
  const getFilteredEvents = useDashboardStore((s) => s.getFilteredEvents)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true)
        const data = await apiService.getEvents()
        setEvents(data)
        setLastUpdated(new Date())
      } catch (error) {
        console.error('Failed to load events:', error)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
    const interval = setInterval(loadEvents, 30000)
    return () => clearInterval(interval)
  }, [setEvents, setLoading])

  const filteredEvents = getFilteredEvents()
  const darkCandidates = events.filter((e) => e.status === 'AIS_UNMATCHED').length
  const avgConfidence = events.length > 0
    ? (events.reduce((sum, e) => sum + e.confidence, 0) / events.length * 100).toFixed(1)
    : '0'
  const gfwMatches = events.filter((e) => e.gfw_match).length
  const [lastUpdated, setLastUpdated] = useState(new Date())

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-ocean-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Last Updated */}
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-400">
            Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Auto-refresh every 30s</span>
          </div>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Events"
            value={events.length}
            icon={<Target className="w-5 h-5 text-ocean-400" />}
            trend="up"
          />
          <StatsCard
            title="Dark Candidates"
            value={darkCandidates}
            change={Math.round((darkCandidates / Math.max(events.length, 1)) * 100)}
            icon={<AlertTriangle className="w-5 h-5 text-danger-400" />}
            trend="up"
          />
          <StatsCard
            title="Avg Confidence"
            value={`${avgConfidence}%`}
            icon={<TrendingUp className="w-5 h-5 text-ocean-400" />}
          />
          <StatsCard
            title="GFW Matches"
            value={gfwMatches}
            change={Math.round((gfwMatches / Math.max(events.length, 1)) * 100)}
            icon={<Users className="w-5 h-5 text-ocean-400" />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <FilterPanel />
              <DetectionUpload />
            </div>
          </div>

          {/* Center - Map and Charts */}
          <div className="lg:col-span-3 space-y-6">
            {/* Map */}
            <MapComponent />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <StatusChart />
              </div>
              <div className="md:col-span-1">
                <ConfidenceChart />
              </div>
              <div className="md:col-span-1">
                <TimeSeriesChart />
              </div>
              <div className="md:col-span-1">
                <RegionChart />
              </div>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <EventTable />

        {/* Event Detail Modal */}
        <EventDetail />
      </main>
    </div>
  )
}
