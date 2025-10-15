
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addItineraryEntries, getItineraries, updateItineraryEntry } from './itineraryStorage';
import { getPackingLists, updatePackingList } from './packingStorage';
import { createBudget, getBudgets, saveBudgets } from './budgetStorage';
import { getHotels } from './hotelStorage';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'TRIPS';

export const addTrip = async (trip) => {
  const trips = await getTrips();
  console.log('📘 Existing trips:', trips);

  const updatedTrips = [...trips, trip];
  await saveTrips(updatedTrips);
  console.log('✅ Trip saved successfully:', trip);

  // ADDING ITINERARIES AUTOMATICALLY (IN HELPER FUNCTION)
  const itineraryEntries = generateItinerary(trip);
  await addItineraryEntries(itineraryEntries);

  // ADDING BUDGETS HERE
  const existingBudgets = await getBudgets();

  const newBudgets = [
    createBudget('Accomodation', 0, trip.id),
    createBudget('Flights', 0, trip.id),
  ];

  const combinedBudgets = [...existingBudgets, ...newBudgets];
  await saveBudgets(combinedBudgets);
};

export const getTrips = async () => {
  const trips = await AsyncStorage.getItem(STORAGE_KEY);
  return trips ? JSON.parse(trips) : [];
};

export const saveTrips = async (trips) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
};

export const updateTrip = async (updatedTrip) => {
  const trips = await getTrips();
  const newTrips = trips.map(t => t.id === updatedTrip.id ? updatedTrip : t);
  await saveTrips(newTrips);
};

export const deleteTrip = async (tripId) => {
  const trips = await getTrips();
  const filtered = trips.filter(t => t.id !== tripId);
  await saveTrips(filtered);

  // Delete associated itineraries
  const allItineraries = await getItineraries();
  const remainingItineraries = allItineraries.filter(e => e.tripId !== tripId);
  await AsyncStorage.setItem('ITINERARIES', JSON.stringify(remainingItineraries));

  // Delete associated packing lists
  const allPacking = await getPackingLists();
  const remainingPacking = allPacking.filter(pl => pl.tripId !== tripId);
  await AsyncStorage.setItem('PACKING_LISTS', JSON.stringify(remainingPacking));

  // Delete associated hotels
  const allHotels = await getHotels();
  const remainingHotels = allHotels.filter(h => h.tripId !== tripId);
  await AsyncStorage.setItem('HOTELS', JSON.stringify(remainingHotels));
};


// HELPER FUNCTIONS FOR OTHER PAGE FUNCTIONS ----------------------------------------------------------------

// generate itinerary for the trip dates
const generateItinerary = (trip) => {
  const { id: tripId, startDate, endDate } = trip;

  const [sd, sm, sy] = startDate.split('/').map(Number);
  const [ed, em, ey] = endDate.split('/').map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);

  const entries = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    entries.push({
      id: uuidv4(),
      tripId,
      date: d.toISOString(),
      day: '',
      night: '',
    });
  }
  return entries;
};
