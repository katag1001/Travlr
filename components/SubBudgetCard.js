import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, ProgressBar } from 'react-native-paper';
import { modalButtonText } from '../screens/Stylesheet';

export default function SubBudgetCard({ budget, onEdit, onDelete, onPress }) {
  const spent = budget.spent || 0;
  const total = budget.total;
  const isOverspent = spent > total;
  const progress = Math.min(spent / total, 1);
  const percentSpent = ((spent / total) * 100).toFixed(1);

  let progressColor = '#263041';
  if (isOverspent) {
    progressColor = 'red';
  } else if (percentSpent > 80) {
    progressColor = 'orange';
  }

  const hideDelete = budget.budgetName === 'Accommodation' || budget.budgetName === 'Transport';

  return (
    <Card style={styles.subCard} onPress={onPress}>
      <Card.Content>
        <View style={styles.subHeaderRow}>
          <Text style={styles.subCardTitle}>{budget.budgetName}</Text>
          <View style={styles.subActionButtons}>
            <Button compact onPress={onEdit} textColor={modalButtonText}>
              Edit
            </Button>

            {!hideDelete && (
              <Button compact icon="delete" onPress={onDelete} textColor={modalButtonText} />
            )}
          </View>
        </View>
        <Text style={styles.subBudgetTotal}>£{total.toFixed(2)}</Text>
        <Text style={styles.subTitle}>
          Spent: £{spent.toFixed(2)} ({percentSpent}%)
        </Text>
        <ProgressBar
          progress={progress}
          color={progressColor}
          style={[styles.subProgressBar, { backgroundColor: '#ccdffeff' }]}
        />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  subCard: {
    flex: 1,
    marginHorizontal: 4,
    maxWidth: '100%',
    marginBottom: 10,
    paddingVertical: 2,
    borderColor: '#263041',
    borderWidth: 1,
    borderRadius: 3,
    backgroundColor: 'white',
  },
  subHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subActionButtons: {
    flexDirection: 'row',
  },
  subBudgetTotal: {
    fontSize: 14,
    marginBottom: 2,
  },
  subTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  subProgressBar: {
    height: 8,
    borderRadius: 4,
  },
});
