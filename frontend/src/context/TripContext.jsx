import React, { createContext, useState, useEffect } from 'react'
import {
  getAllTrips,
  createTrip as createTripAPI,
  updateTrip as updateTripAPI,
  deleteTrip as deleteTripAPI,
  createItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
  getItineraryItems
} from '../utils/api'

export const TripContext = createContext()

// Helper: parse either "yyyy-mm-dd" or "mm/dd/yyyy" to Date
const parseDate = (value) => {
  if (!value) return null
  // HTML date input -> "yyyy-mm-dd"
  if (value.includes('-')) {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }
  // Form text dates -> "mm/dd/yyyy"
  if (value.includes('/')) {
    const [m, d, y] = value.split('/')
    const dObj = new Date(`${y}-${m}-${d}`)
    return isNaN(dObj.getTime()) ? null : dObj
  }
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}

// Helper: compute dayIndex (1-based) from trip start date and item date
const computeDayIndex = (tripStartDate, itemDate) => {
  const tripStart = parseDate(tripStartDate)
  const item = parseDate(itemDate)
  if (!tripStart || !item) return 1

  const msPerDay = 1000 * 60 * 60 * 24
  const diff = Math.floor((item - tripStart) / msPerDay)
  return diff < 0 ? 1 : diff + 1
}

// Helper: build itinerary payloads from the four pieces of data
const buildItineraryItemsFromData = (trip, {
  flightData,
  carRentalData,
  activityData,
  lodgingData
}) => {
  const items = []
  const tripStartDate = trip.startDate || trip.start_date

  // Flights
  if (flightData?.flights?.length) {
    flightData.flights.forEach((flight, index) => {
      const dayIndex = computeDayIndex(tripStartDate, flight.departure || flight.date)
      const title = flight.customName || flight.flightNumber || `Flight ${index + 1}`

      const descriptionLines = []
      if (flight.airline) descriptionLines.push(`Airline: ${flight.airline}`)
      if (flight.flightNumber) descriptionLines.push(`Flight: ${flight.flightNumber}`)
      if (flight.seats) descriptionLines.push(`Seats: ${flight.seats}`)
      const description = descriptionLines.join('\n') || 'Flight'

      const notesLines = []
      if (flightData.totalCost) {
        notesLines.push(`Total Cost: ${flightData.totalCost}`)
      }
      const notes = notesLines.join('\n') || null

      items.push({
        dayIndex,
        title,
        description,
        startTime: null,
        endTime: null,
        locationName: trip.location || trip.name || 'Flight',
        activityType: 'Flight',
        notes
      })
    })
  }

  // Car rental (single block)
  if (carRentalData?.rentalAgency) {
    const dayIndex = computeDayIndex(tripStartDate, carRentalData.pickupDate)
    const descriptionLines = []

    if (carRentalData.pickupDate || carRentalData.pickupTime) {
      descriptionLines.push(
        `Pickup: ${carRentalData.pickupDate || ''} ${carRentalData.pickupTime || ''}`.trim()
      )
    }
    if (carRentalData.dropoffDate || carRentalData.dropoffTime) {
      descriptionLines.push(
        `Dropoff: ${carRentalData.dropoffDate || ''} ${carRentalData.dropoffTime || ''}`.trim()
      )
    }
    if (carRentalData.confirmationNumber) {
      descriptionLines.push(`Confirmation: ${carRentalData.confirmationNumber}`)
    }
    const description = descriptionLines.join('\n') || 'Car rental'

    const notesLines = []
    if (carRentalData.website) notesLines.push(`Website: ${carRentalData.website}`)
    if (carRentalData.email) notesLines.push(`Email: ${carRentalData.email}`)
    if (carRentalData.totalCost) notesLines.push(`Total Cost: ${carRentalData.totalCost}`)
    const notes = notesLines.join('\n') || null

    items.push({
      dayIndex,
      title: `Car Rental - ${carRentalData.rentalAgency}`,
      description,
      startTime: carRentalData.pickupTime || null,
      endTime: carRentalData.dropoffTime || null,
      locationName:
        carRentalData.pickupLocation?.location ||
        carRentalData.rentalAgency ||
        (trip.location || trip.name || ''),
      activityType: 'Car Rental',
      notes
    })
  }

  // Activities (one item per activity)
  if (Array.isArray(activityData) && activityData.length > 0) {
    activityData.forEach((activity) => {
      const dayIndex = computeDayIndex(tripStartDate, activity.startDate)
      const descriptionLines = []

      if (activity.venue) descriptionLines.push(`Venue: ${activity.venue}`)
      if (activity.address) descriptionLines.push(`Address: ${activity.address}`)
      if (activity.phone) descriptionLines.push(`Phone: ${activity.phone}`)
      const description = descriptionLines.join('\n') || activity.description || 'Activity'

      const notesLines = []
      if (activity.website) notesLines.push(`Website: ${activity.website}`)
      if (activity.email) notesLines.push(`Email: ${activity.email}`)
      if (activity.totalCost) notesLines.push(`Total Cost: ${activity.totalCost}`)
      const notes = notesLines.join('\n') || null

      items.push({
        dayIndex,
        title: activity.activityName || 'Activity',
        description,
        startTime: activity.startTime || null,
        endTime: activity.endTime || null,
        locationName: activity.venue || activity.location || (trip.location || trip.name || ''),
        activityType: 'Activity',
        notes
      })
    })
  }

  // Lodging (one item per lodging block)
  if (Array.isArray(lodgingData) && lodgingData.length > 0) {
    lodgingData.forEach((lodging) => {
      const dayIndex = computeDayIndex(tripStartDate, lodging.startDate)
      const descriptionLines = []

      if (lodging.venue) descriptionLines.push(`Venue: ${lodging.venue}`)
      if (lodging.address) descriptionLines.push(`Address: ${lodging.address}`)
      if (lodging.phone) descriptionLines.push(`Phone: ${lodging.phone}`)
      if (lodging.confirmationNumber) {
        descriptionLines.push(`Confirmation: ${lodging.confirmationNumber}`)
      }
      const description = descriptionLines.join('\n') || 'Lodging'

      const notesLines = []
      if (lodging.website) notesLines.push(`Website: ${lodging.website}`)
      if (lodging.email) notesLines.push(`Email: ${lodging.email}`)
      if (lodging.totalCost) notesLines.push(`Total Cost: ${lodging.totalCost}`)
      const notes = notesLines.join('\n') || null

      items.push({
        dayIndex,
        title: lodging.lodgingName || 'Lodging',
        description,
        startTime: lodging.startTime || null,
        endTime: lodging.endTime || null,
        locationName: lodging.venue || lodging.location || (trip.location || trip.name || ''),
        activityType: 'Lodging',
        notes
      })
    })
  }

  return items
}

export const TripProvider = ({ children }) => {
  const [lodgingData, setLodgingData] = useState([])
  const [flightData, setFlightData] = useState({
    flights: [],
    totalCost: ''
  })

  const [carRentalData, setCarRentalData] = useState({
    rentalAgency: '',
    pickupDate: '',
    pickupTime: '',
    dropoffDate: '',
    dropoffTime: '',
    website: '',
    email: '',
    confirmationNumber: '',
    totalCost: '',
    pickupLocation: {
      location: '',
      address: '',
      phone: ''
    },
    dropoffLocation: {
      location: '',
      address: '',
      phone: ''
    },
    rentalInfo: {
      carType: '',
      mileageCharges: '',
      carDetails: ''
    }
  })

  // Activity data (array of activities)
  const [activityData, setActivityData] = useState([])

  const [upcomingTrips, setUpcomingTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load trips from backend when component mounts
  useEffect(() => {
    const loadTrips = async () => {
      const token = localStorage.getItem('token')
      if (!token) return // Skip if not authenticated

      setLoading(true)
      setError(null)
      try {
        const trips = await getAllTrips()
        setUpcomingTrips(trips)
      } catch (err) {
        console.error('Failed to load trips:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadTrips()
  }, [])

  // Create a new trip + itinerary
  const addTrip = async (tripData) => {
    setLoading(true)
    setError(null)
    try {
      // Extract itinerary data from tripData if provided,
      // otherwise fall back to context state.
      const {
        flightData: fd,
        carRentalData: cd,
        activityData: ad,
        lodgingData: ld,
        ...basicTripData
      } = tripData

      const newTrip = await createTripAPI(basicTripData)

      const itineraryItems = buildItineraryItemsFromData(newTrip, {
        flightData: fd ?? flightData,
        carRentalData: cd ?? carRentalData,
        activityData: ad ?? activityData,
        lodgingData: ld ?? lodgingData
      })

      for (const item of itineraryItems) {
        await createItineraryItem(newTrip.id, item)
      }

      setUpcomingTrips(prev => [newTrip, ...prev])

      // Optionally clear itinerary-related state after save
      setFlightData({ flights: [], totalCost: '' })
      setCarRentalData({
        rentalAgency: '',
        pickupDate: '',
        pickupTime: '',
        dropoffDate: '',
        dropoffTime: '',
        website: '',
        email: '',
        confirmationNumber: '',
        totalCost: '',
        pickupLocation: {
          location: '',
          address: '',
          phone: ''
        },
        dropoffLocation: {
          location: '',
          address: '',
          phone: ''
        },
        rentalInfo: {
          carType: '',
          mileageCharges: '',
          carDetails: ''
        }
      })
      setActivityData([])
      setLodgingData([])

      return newTrip
    } catch (err) {
      console.error('Failed to create trip (or itinerary):', err)
      setError(err.message)

      // Fallback: local-only trip if backend fails
      const localTrip = {
        id: Date.now(),
        ...tripData,
        createdAt: new Date().toISOString()
      }
      setUpcomingTrips(prev => [localTrip, ...prev])
      return localTrip
    } finally {
      setLoading(false)
    }
  }

  // Update an existing trip by id
  const updateTrip = async (updatedTrip) => {
    if (!updatedTrip || !updatedTrip.id) return

    setLoading(true)
    setError(null)
    try {
      const updated = await updateTripAPI(updatedTrip.id, updatedTrip)

      setUpcomingTrips(prev =>
        prev.map(t => (t.id === updated.id ? updated : t))
      )
      return updated
    } catch (err) {
      console.error('Failed to update trip:', err)
      setError(err.message)

      // Fallback to local state update if backend fails
      setUpcomingTrips(prev =>
        prev.map(t => (t.id === updatedTrip.id ? updatedTrip : t))
      )
      return updatedTrip
    } finally {
      setLoading(false)
    }
  }

  // Delete a trip by id
  const deleteTrip = async (tripId) => {
    setLoading(true)
    setError(null)
    try {
      await deleteTripAPI(tripId)

      setUpcomingTrips(prev => prev.filter(t => t.id !== tripId))
      return true
    } catch (err) {
      console.error('Failed to delete trip:', err)
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Load itinerary items for a specific trip
  // Returns array of: { id, dayIndex, title, description, startTime, endTime, locationName, activityType, notes }
  const loadItineraryItems = async (tripId) => {
    setLoading(true)
    setError(null)
    try {
      const items = await getItineraryItems(tripId)
      return items
    } catch (err) {
      console.error('Failed to load itinerary items:', err)
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Add a single itinerary item (for adding to existing trip via generic form)
  const addItineraryItem = async (tripId, itemData) => {
    setLoading(true)
    setError(null)
    try {
      const newItem = await createItineraryItem(tripId, itemData)
      return newItem
    } catch (err) {
      console.error('Failed to add itinerary item:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update a single itinerary item
  const updateSingleItineraryItem = async (tripId, itemId, itemData) => {
    setLoading(true)
    setError(null)
    try {
      const updatedItem = await updateItineraryItem(tripId, itemId, itemData)
      return updatedItem
    } catch (err) {
      console.error('Failed to update itinerary item:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Delete a single itinerary item
  const deleteSingleItineraryItem = async (tripId, itemId) => {
    setLoading(true)
    setError(null)
    try {
      await deleteItineraryItem(tripId, itemId)
      return true
    } catch (err) {
      console.error('Failed to delete itinerary item:', err)
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const clearFlightData = () => {
    setFlightData({
      flights: [],
      totalCost: ''
    })
  }

  const clearCarRentalData = () => {
    setCarRentalData({
      rentalAgency: '',
      pickupDate: '',
      pickupTime: '',
      dropoffDate: '',
      dropoffTime: '',
      website: '',
      email: '',
      confirmationNumber: '',
      totalCost: '',
      pickupLocation: {
        location: '',
        address: '',
        phone: ''
      },
      dropoffLocation: {
        location: '',
        address: '',
        phone: ''
      },
      rentalInfo: {
        carType: '',
        mileageCharges: '',
        carDetails: ''
      }
    })
  }

  return (
    <TripContext.Provider
      value={{
        flightData,
        setFlightData,
        carRentalData,
        setCarRentalData,
        activityData,
        setActivityData,
        lodgingData,
        setLodgingData,
        upcomingTrips,
        addTrip,
        updateTrip,
        deleteTrip,
        clearFlightData,
        clearCarRentalData,
        selectedTrip,
        setSelectedTrip,
        loading,
        error,
        loadItineraryItems,
        addItineraryItem,
        updateSingleItineraryItem,
        deleteSingleItineraryItem
      }}
    >
      {children}
    </TripContext.Provider>
  )
}

