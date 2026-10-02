import React from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { useDashboardStore } from '../store/dashboardStore'

const MapComponent: React.FC = () => {
  const events = useDashboardStore((s) => s.getFilteredEvents())
  const selectedEvent = useDashboardStore((s) => s.selectedEvent)
  const loading = useDashboardStore((s) => s.loading)

  const getColor = (status: string) => {
    switch (status) {
      case 'AIS_VISIBLE':
        return '#22c55e'
      case 'AIS_PARTIAL':
        return '#eab308'
      case 'AIS_UNMATCHED':
        return '#ef4444'
      default:
        return '#0ea5e9'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AIS_VISIBLE':
        return 'AIS Visible'
      case 'AIS_PARTIAL':
        return 'Partially Visible'
      case 'AIS_UNMATCHED':
        return 'Dark Candidate'
      default:
        return status
    }
  }

  const defaultCenter: [number, number] = [57.75, 10.9]

  if (loading) {
    return (
      <div className="glass-effect card-shadow rounded-lg overflow-hidden h-full min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-ocean-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-effect card-shadow rounded-lg overflow-hidden h-full min-h-[600px]">
      <MapContainer
        center={defaultCenter}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {events.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 0l7-3.5A1 1 0 0117 5.382v10.236a1 1 0 01-1.447.894L9 9m0 0l7-3.5" />
                </svg>
              </div>
              <p className="text-lg font-semibold mb-2">No Events Found</p>
              <p className="text-sm">No events match the current filters or no data available</p>
            </div>
          </div>
        ) : (
          events.map((event) => (
            <CircleMarker
              key={event.id}
              center={[event.lat, event.lon]}
              radius={selectedEvent?.id === event.id ? 12 : 8}
              fillColor={getColor(event.status)}
              color={getColor(event.status)}
              weight={selectedEvent?.id === event.id ? 3 : 2}
              opacity={1}
              fillOpacity={0.8}
              className="transition-all"
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold mb-1">{getStatusLabel(event.status)}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(event.timestamp).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-600">
                    Distance: {event.distance}m
                  </p>
                  <p className="text-xs text-gray-600">
                    Confidence: {(event.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          ))
        )}
      </MapContainer>
    </div>
  )
}

export default MapComponent
