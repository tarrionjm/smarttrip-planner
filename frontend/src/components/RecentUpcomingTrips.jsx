import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaLink } from 'react-icons/fa'
import { TripContext } from '../context/TripContext'

const RecentUpcomingTrips = () => {
  const _ctx = useContext(TripContext) || {}
  const { upcomingTrips = [], setSelectedTrip } = _ctx
  const navigate = useNavigate()

  // Filter out past trips (only show upcoming/future trips)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const futureTrips = upcomingTrips.filter(trip => {
    if (!trip.endDate) return true // Show trips without end date
    const endDate = new Date(trip.endDate)
    return endDate >= today
  })

  // Limit Trips to 3 on homepage
  const recentTrips = futureTrips.slice(0, 3)

  const handleViewTrip = (trip) => {
    setSelectedTrip(trip)
    navigate('/upcoming-trips-page/trip-details')
  }

  // Only render if there are trips
  if (futureTrips.length === 0) {
    return null
  }

  return (
    <section className="bg-gray-50 px-4 py-10">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 m-auto">
        <h2 className="text-3xl sm:text-4xl font-black uppercase text-black mb-6 sm:mb-8 text-center">
          Upcoming Trips
        </h2>
        <div className="flex justify-center">
          <div className="w-full max-w-md space-y-4 sm:space-y-6">
            {recentTrips.map((trip) => (
              <div key={trip.id}>
                {/* Neo Brutalism Card */}
                <div className="bg-white border-4 border-black rounded-lg p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <div className="mb-4 pb-4 border-b-4 border-black">
                    <h3 className="text-xl sm:text-2xl font-black mb-2 uppercase break-words">{trip.tripName}</h3>
                    <p className="text-xs sm:text-sm font-bold uppercase text-gray-700 break-words">📍 {trip.tripLocation}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-xs sm:text-sm font-bold mb-2">📅 DATES</p>
                    <p className="font-mono text-xs sm:text-sm text-gray-800 break-all">{trip.startDate} → {trip.endDate}</p>
                  </div>

                  {trip.description && (
                    <div className="mb-4 p-2 sm:p-3 bg-gray-100 border-2 border-black rounded">
                      <p className="text-xs font-black uppercase mb-1">Description</p>
                      <p className="text-xs sm:text-sm text-gray-800 break-words">{trip.description}</p>
                    </div>
                  )}
                  
                  {/* Show flight details if available */}
                  {trip.flightData && trip.flightData.flights.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-100 border-3 border-black rounded">
                      <p className="text-xs font-black uppercase mb-2">✈️ Flights ({trip.flightData.flights.length})</p>
                      {trip.flightData.flights.map((flight) => (
                        <p key={flight.id} className="text-sm font-bold text-gray-800 mb-1">{flight.customName || `Flight ${flight.id}`} - {flight.airline}</p>
                      ))}
                      {trip.flightData.totalCost && <p className="text-sm font-black mt-2">TOTAL: ${trip.flightData.totalCost}</p>}
                    </div>
                  )}

                  {/* Show car rental details if available */}
                  {trip.carRentalData && trip.carRentalData.rentalAgency && (
                    <div className="mb-4 p-3 bg-green-100 border-3 border-black rounded">
                      <p className="text-xs font-black uppercase mb-2">🚗 Car Rental</p>
                      <p className="text-sm font-bold text-gray-800 mb-1">{trip.carRentalData.rentalAgency}</p>
                      {trip.carRentalData.totalCost && <p className="text-sm font-black mt-2">TOTAL: ${trip.carRentalData.totalCost}</p>}
                    </div>
                  )}

                  {/* Show lodging details if available */}
                  {trip.lodgingData && trip.lodgingData.length > 0 && (
                    <div className="mb-4 p-3 bg-purple-100 border-3 border-black rounded">
                      <p className="text-xs font-black uppercase mb-2">🏨 Lodging ({trip.lodgingData.length})</p>
                      {trip.lodgingData.map((lodging) => (
                        <p key={lodging.id} className="text-sm font-bold text-gray-800 mb-1">{lodging.lodgingName} - {lodging.venue}</p>
                      ))}
                    </div>
                  )}

                  {/* Show activity details if available */}
                  {trip.activityData && trip.activityData.length > 0 && (
                    <div className="mb-4 p-3 bg-yellow-100 border-3 border-black rounded">
                      <p className="text-xs font-black uppercase mb-2">🗓️ Activities ({trip.activityData.length})</p>
                      {trip.activityData.map((activity) => (
                        <p key={activity.id} className="text-sm font-bold text-gray-800 mb-1">{activity.activityName} - {activity.venue}</p>
                      ))}
                    </div>
                  )}

                  {/* View Trip Button */}
                  <button
                    onClick={() => handleViewTrip(trip)}
                    className="w-full bg-black text-white border-4 border-black rounded font-black uppercase py-2 sm:py-3 px-3 sm:px-4 mt-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-sm sm:text-lg"
                  >
                    View Trip
                  </button>
                  {/* Manage Sharing Button */}
                  <button
                    onClick={() => navigate(`/upcoming-trips-page/manage-sharing/${trip.id}`)}
                    className="w-full flex items-center justify-center gap-2 bg-white border-4 border-black rounded font-black uppercase py-2 sm:py-3 px-3 sm:px-4 mt-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-sm sm:text-lg text-black"
                  >
                    <FaLink className="text-base sm:text-xl" /> Manage Sharing
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default RecentUpcomingTrips