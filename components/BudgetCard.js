import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, ProgressBar } from 'react-native-paper';
import PieChart from 'react-native-pie-chart';

export default function BudgetCard({ 
  budget, 
  isTotal = false, 
  onEdit, 
  onDelete, 
  onPress 
}) {
  const spent = budget.spent || 0;
  const total = budget.total;

  if (isTotal) {
    const totalSpent = spent;
    const totalBudget = total;

    const widthAndHeight = 120;

    const isEmpty = totalSpent === 0 && totalBudget === 0;
    const isOverspent = totalSpent > totalBudget;

    let series;

    if (isEmpty) {
      series = [{ value: 1, color: '#cccccc' }];
    } else if (isOverspent) {
      series = [{ value: 1, color: 'red' }];
    } else {
      series = [
        { value: totalBudget - totalSpent, color: '#2fff00ff' },
        { value: totalSpent, color: '#00d9ffff' },
      ];
    }

    const centerText = isEmpty
      ? '£0'
      : isOverspent
      ? `£${(totalSpent - totalBudget).toFixed(2)} over`
      : `£${totalSpent.toFixed(2)} of £${totalBudget.toFixed(2)}`;

    return (
      <Card style={[styles.card, styles.fullWidthCard]}>
        <Card.Title title="Total Budget" titleStyle={styles.cardTitle} />
        <Card.Content style={{ alignItems: 'center' }}>
          <View style={styles.chartWrapper}>
            <PieChart widthAndHeight={widthAndHeight} series={series} cover={0.8} />
            <View style={styles.centerTextWrapper}>
              <Text style={styles.centerText}>{centerText}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  } else {
    const isOverspent = spent > total;
    const progress = Math.min(spent / total, 1);
    const progressText = isOverspent
      ? `Overbudget by £${(spent - total).toFixed(2)}`
      : `Spent £${spent.toFixed(2)} out of £${total.toFixed(2)}`;

    return (
      <Card style={styles.card} onPress={onPress}>
        <Card.Title title={budget.budgetName} titleStyle={styles.cardTitle} />
        <Card.Content>
          <Text style={styles.progressText}>{progressText}</Text>
          <ProgressBar progress={progress} color={isOverspent ? 'red' : '#6200ee'} style={styles.progressBar} />
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Button compact onPress={onEdit}>Edit</Button>
          {budget.budgetName !== 'Accomodation' && budget.budgetName !== 'Flights' && (
            <Button compact icon="delete" onPress={onDelete} />
          )}
        </Card.Actions>
      </Card>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginHorizontal: 4,
    maxWidth: '100%',
    marginBottom: 10,
  },
  fullWidthCard: {
    maxWidth: '100%',
    marginBottom: 16,
  },
  cardTitle: {
    textAlign: 'center',
    fontSize: 16,
  },
  cardActions: {
    justifyContent: 'center',
  },
  chartWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerTextWrapper: {
    position: 'absolute',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  progressText: {
    marginBottom: 4,
    fontSize: 14,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
  },
});
