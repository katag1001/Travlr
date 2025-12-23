
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addItineraryEntries, getItineraries, updateItineraryEntry } from './itineraryStorage';
import { getPackingLists, updatePackingList } from './packingStorage';
import { createBudget, getBudgets, saveBudgets, getSpends, } from './budgetStorage';
import { getHotels } from './hotelStorage';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'TRIPS';

export const addTrip = async (trip) => {
  const trips = await getTrips();
  console.log('📘 Existing trips:', trips);

  const updatedTrips = [...trips, trip];
  await saveTrips(updatedTrips);
  console.log('✅ Trip saved successfully:', trip);

  // ADDING AUTOMATIC BUDGETS HERE
  const existingBudgets = await getBudgets();

  const newBudgets = [
    createBudget('Accommodation', 0, trip.id),
    createBudget('Transport', 0, trip.id),
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


    // Delete associated packing lists
  const allPacking = await getPackingLists();
  const remainingPacking = allPacking.filter(pl => pl.tripId !== tripId);
  await AsyncStorage.setItem('PACKING_LISTS', JSON.stringify(remainingPacking));
  console.log("packing lists deleted")

  // Delete associated itineraries
  const allItineraries = await getItineraries();
  const remainingItineraries = allItineraries.filter(e => e.tripId !== tripId);
  await AsyncStorage.setItem('ITINERARIES', JSON.stringify(remainingItineraries));
  console.log("itineraries deleted")

  // Delete associated hotels
  const allHotels = await getHotels();
  const remainingHotels = allHotels.filter(h => h.tripId !== tripId);
  await AsyncStorage.setItem('HOTELS', JSON.stringify(remainingHotels));
  console.log("hotels deleted")


  // Delete associated BUDGET
  const allBudgets = await getBudgets();
  const remainingBudgets = allBudgets.filter(b => b.tripId !== tripId);
  await AsyncStorage.setItem('BUDGETS', JSON.stringify(remainingBudgets));
  console.log("budget deleted")

  // Delete associated BUDGET
  const allSpends = await getSpends();
  const remainingSpends = allSpends.filter(b => b.tripId !== tripId);
  await AsyncStorage.setItem('SPENDS', JSON.stringify(remainingSpends));
  console.log("spends deleted")


  const updatedTrips = await getTrips();
  console.log('📘 Updated trips after deletion:', updatedTrips);
  return updatedTrips;

};


