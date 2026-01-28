import AsyncStorage from '@react-native-async-storage/async-storage';
import UUID from 'react-native-uuid';
import { getHotels, fixDate } from './hotelStorage'; 
import { getTransport } from './transportStorage';

const BUDGETS_KEY = 'BUDGETS';
const SPENDS_KEY = 'SPENDS';

// MODELS ------------------------------------------------------------------------------------------------------

export const createBudget = (budgetName, total, tripId) => {
  return {
    id: UUID.v4(),
    tripId,
    budgetName,
    total: total || 0,
    spent: 0,
  };
};

export const createSpend = (
  budgetId,
  spendName,
  date,
  spend,
  tripId,
  {
    hotelId = null,
    transportId = null,
  } = {}
) => {
  return {
    id: UUID.v4(),
    tripId,
    budgetId,
    spendName,
    date: date instanceof Date ? date.toISOString() : date,
    spend: spend || 0,
    hotelId,
    transportId,
  };
};




// BUDGET FUNCTIONS -----------------------------------------------------------------------------------------

export const getBudgets = async () => {
  const data = await AsyncStorage.getItem(BUDGETS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveBudgets = async (budgets) => {
  await AsyncStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
};

export const deleteBudget = async (budgetId) => {
  const budgets = await getBudgets();
  const updatedBudgets = budgets.filter(b => b.id !== budgetId);
  await saveBudgets(updatedBudgets);

  // Also delete all spends associated with this budget
  const spends = await getSpends();
  const updatedSpends = spends.filter(s => s.budgetId !== budgetId);
  await saveSpends(updatedSpends);
};

// SPEND FUNCTIONS --------------------------------------------------------------------------------------------

export const getSpends = async () => {
  const data = await AsyncStorage.getItem(SPENDS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveSpends = async (spends) => {
  await AsyncStorage.setItem(SPENDS_KEY, JSON.stringify(spends));
};

export const getSpendsForBudget = async (budgetId) => {
  const spends = await getSpends();
  return spends.filter(s => s.budgetId === budgetId);
};

export const addSpend = async (newSpend) => {
  try {
    if (!newSpend || !newSpend.budgetId || typeof newSpend.spend !== 'number') {
      throw new Error('Invalid spend object');
    }

    const spends = await getSpends();
    spends.push(newSpend);
    await saveSpends(spends);

    const budgets = await getBudgets();
    const idx = budgets.findIndex(b => b.id === newSpend.budgetId);
    if (idx !== -1) {
      budgets[idx].spent = (budgets[idx].spent || 0) + newSpend.spend;
      await saveBudgets(budgets);
    }

    console.log('🧾 Saving spend with links:', {
  spendId: newSpend.id,
  hotelId: newSpend.hotelId,
  transportId: newSpend.transportId,
});
  } catch (err) {
    console.error('💥 Error in addSpend:', err);
    throw err; 
  }


  
};


export const updateSpend = async (updatedSpend) => {
  const spends = await getSpends();
  const idx = spends.findIndex(s => s.id === updatedSpend.id);
  if (idx === -1) return;

  const old = spends[idx];
  const diff = updatedSpend.spend - old.spend;

  spends[idx] = updatedSpend;
  await saveSpends(spends);

  // Update related budget
  const budgets = await getBudgets();
  const bidx = budgets.findIndex(b => b.id === updatedSpend.budgetId);
  if (bidx !== -1) {
    budgets[bidx].spent = (budgets[bidx].spent || 0) + diff;
    await saveBudgets(budgets);
  }
};

export const deleteSpend = async (spendId) => {
  const spends = await getSpends();
  const spend = spends.find(s => s.id === spendId);
  if (!spend) return;

  const updatedSpends = spends.filter(s => s.id !== spendId);
  await saveSpends(updatedSpends);

  const budgets = await getBudgets();
  const bidx = budgets.findIndex(b => b.id === spend.budgetId);
  if (bidx !== -1) {
    budgets[bidx].spent = (budgets[bidx].spent || 0) - spend.spend;
    await saveBudgets(budgets);
  }
};

// EXTRA FUNCTION DO TO BE USED FOR HOTELS AND FLIGTHS -------------------------------------------------------

export const getBudgetIdByName = async (budgetName, tripId) => {
  const budgets = await getBudgets();
  console.log('DEBUG budgets for trip:', tripId, budgets);
  const budget = budgets.find(b => b.budgetName === budgetName && b.tripId === tripId);
  console.log('DEBUG found budget:', budget);
  return budget ? budget.id : null;
};

// Extra functions for deleting spends by linked IDs ---------------------------------

export const deleteSpendByHotelId = async (hotelId) => {
  const spends = await getSpends();

  const hotelSpends = spends.filter(
    s => s.hotelId === hotelId
  );

  for (const spend of hotelSpends) {
    await deleteSpend(spend.id);
  }
};

export const updateSpendByHotelId = async (hotelId) => {
  const hotels = await getHotels();
  const hotel = hotels.find(h => h.id === hotelId);
  if (!hotel) return;

  const spends = await getSpends();
  const spend = spends.find(s => s.hotelId === hotelId);
  if (!spend) return;

  const isoDate = fixDate(hotel.startDate);

  const updatedSpend = {
    ...spend,
    spendName: `Accommodation: ${hotel.hotelName}`,
    date: isoDate,
    spend: hotel.cost || 0,
  };

  await updateSpend(updatedSpend);
};

export const deleteSpendByTransportId = async (transportId) => {
  const spends = await getSpends();

  const transportSpends = spends.filter(
    s => s.transportId === transportId
  );

  for (const spend of transportSpends) {
    await deleteSpend(spend.id);
  }
};

export const updateSpendByTransportId = async (transportId) => {
  const transports = await getTransport();
  const transport = transports.find(t => t.id === transportId);
  if (!transport) return;

  const spends = await getSpends();
  const spend = spends.find(s => s.transportId === transportId);
  if (!spend) return;

  const isoDate = fixDate(transport.startDate);

  const updatedSpend = {
    ...spend,
    spendName: `${transport.type} to ${transport.to}`,
    date: isoDate,
    spend: transport.cost || 0,
  };

  await updateSpend(updatedSpend);
};





