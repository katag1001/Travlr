// budgetStorage.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import UUID from 'react-native-uuid';

// Keys for AsyncStorage
const BUDGETS_KEY = 'budgets';
const SPENDS_KEY = 'spends';

// Budget model (frontend version)
export const createBudget = (budgetName, total) => {
  return {
  id: UUID.v4(),
    budgetName,
    total: total || 0,
    spent: 0,
  };
};

// Spend model (frontend version)
export const createSpend = (budgetId, spendName, date, spend) => {
  return {
  id: UUID.v4(),
    budgetId,
    spendName,
    date: date instanceof Date ? date.toISOString() : date,
    spend: spend || 0,
  };
};

// ——— Budget functions ———

export const getBudgets = async () => {
  const data = await AsyncStorage.getItem(BUDGETS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveBudgets = async (budgets) => {
  await AsyncStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
};

export const deleteBudget = async (budgetId) => {
  // Remove the budget
  const budgets = await getBudgets();
  const updatedBudgets = budgets.filter(b => b.id !== budgetId);
  await saveBudgets(updatedBudgets);

  // Also delete all spends associated with this budget
  const spends = await getSpends();
  const updatedSpends = spends.filter(s => s.budgetId !== budgetId);
  await saveSpends(updatedSpends);
};

// ——— Spend functions ———

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
  const spends = await getSpends();
  spends.push(newSpend);
  await saveSpends(spends);

  // Update the corresponding budget's spent amount
  const budgets = await getBudgets();
  const idx = budgets.findIndex(b => b.id === newSpend.budgetId);
  if (idx !== -1) {
    budgets[idx].spent = (budgets[idx].spent || 0) + newSpend.spend;
    console.log('Budget updated after spend:', budgets[idx]);
    await saveBudgets(budgets);
  } else {
    console.log('Budget not found for spend:', newSpend);
  }
};

export const updateSpend = async (updatedSpend) => {
  const spends = await getSpends();
  const idx = spends.findIndex(s => s.id === updatedSpend.id);
  if (idx === -1) return;

  const old = spends[idx];
  const diff = updatedSpend.spend - old.spend;

  // Replace it
  spends[idx] = updatedSpend;
  await saveSpends(spends);

  // Update budget spent
  const budgets = await getBudgets();
  const bidx = budgets.findIndex(b => b.id === updatedSpend.budgetId);
  if (bidx !== -1) {
    budgets[bidx].spent = (budgets[bidx].spent || 0) + diff;
    console.log('Budget updated after spend update:', budgets[bidx]);
    await saveBudgets(budgets);
  } else {
    console.log('Budget not found for spend update:', updatedSpend);
  }
};

export const deleteSpend = async (spendId) => {
  const spends = await getSpends();
  const spend = spends.find(s => s.id === spendId);
  if (!spend) {
    // nothing to delete
    return;
  }

  const updatedSpends = spends.filter(s => s.id !== spendId);
  await saveSpends(updatedSpends);

  // Subtract from the budget's spent
  const budgets = await getBudgets();
  const bidx = budgets.findIndex(b => b.id === spend.budgetId);
  if (bidx !== -1) {
    budgets[bidx].spent = (budgets[bidx].spent || 0) - spend.spend;
    console.log('Budget updated after spend delete:', budgets[bidx]);
    await saveBudgets(budgets);
  } else {
    console.log('Budget not found for spend delete:', spend);
  }
};
