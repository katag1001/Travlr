import AsyncStorage from '@react-native-async-storage/async-storage';
import {createSpend, addSpend, getBudgetIdByName} from './budgetStorage';
import { parse } from 'date-fns';

const STORAGE_KEY_HOTEL = 'HOTELS';

export const getHotels = async () => {
  const json = await AsyncStorage.getItem(STORAGE_KEY_HOTEL);
  return json ? JSON.parse(json) : [];
};

export const getHotelsForTrip = async (tripId) => {
  const all = await getHotels();
  return all.filter(pl => pl.tripId === tripId);
};

//Helper function because of the god damn date argghghhghgh
const fixDate = (ddmmyyyy) => {
  try {
    const parsed = parse(ddmmyyyy, 'dd/MM/yyyy', new Date());
    return parsed.toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
};

export const addHotel = async (Hotel) => {
  try {
    const all = await getHotels();
    const updated = [...all, Hotel];
    await AsyncStorage.setItem(STORAGE_KEY_HOTEL, JSON.stringify(updated));

    const budgetId = await getBudgetIdByName('Accomodation', Hotel.tripId);

    if (!budgetId) {
      return;
    }

    const isoDate = fixDate(Hotel.startDate);
    const hotel = `${Hotel.hotelName}`

    const newSpend = createSpend(
      budgetId,
      hotel,
      isoDate,
      Hotel.cost,
      Hotel.tripId
    );

    console.log('✅ Creating spend for hotel:', newSpend);

    await addSpend(newSpend);
  } catch (error) {
    console.error('💥 Error in addHotel():', error);
  }
};



export const updateHotel = async (Hotel) => {
  const all = await getHotels();
  const newAll = all.map(pl => pl.id === Hotel.id ? Hotel : pl);
  await AsyncStorage.setItem(STORAGE_KEY_HOTEL, JSON.stringify(newAll));
};

export const deleteHotel = async (listId) => {
  const all = await getHotels();
  const filtered = all.filter(pl => pl.id !== listId);
  await AsyncStorage.setItem(STORAGE_KEY_HOTEL, JSON.stringify(filtered));
};