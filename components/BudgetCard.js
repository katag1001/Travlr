import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, ProgressBar } from 'react-native-paper';
import PieChart from 'react-native-pie-chart';

import { modalButtonText} from '../screens/Stylesheet';

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
    const remaining = Math.max(total - spent, 0);
    const widthAndHeight = 120;

    const isEmpty = spent === 0 && total === 0;
    const isOverspent = spent > total;

    let series;
    if (isEmpty) {
      series = [{ value: 1, color: 'white' }];
    } else if (isOverspent) {
      series = [{ value: 1, color: 'red' }];
    } else {
      series = [
        { value: remaining, color:  '#9cbef6ff'},
        { value: spent, color:  '#263041' },
      ];
    }

    return (
      <Card style={[styles.totalCard, styles.totalCardWrapper]}>
        <Card.Title title="Total Budget" titleStyle={styles.totalCardTitle} />
        <View style={styles.totalSubRow}>
          <Text style={styles.totalSubText}>Remaining: £{remaining.toFixed(2)}</Text>
          <Text style={styles.totalSubText}>Total Spent: £{spent.toFixed(2)}</Text>
        </View>
        <Card.Content style={{ alignItems: 'center' }}>
          <View style={styles.totalChartWrapper}>
            <PieChart widthAndHeight={widthAndHeight} series={series} cover={0.6} />
            <View style={styles.totalCenterTextWrapper}>
              <Text style={styles.totalCenterText}>£{total.toFixed(2)}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  } else {
    const isOverspent = spent > total;
    const progress = Math.min(spent / total, 1);
    const percentSpent = ((spent / total) * 100).toFixed(1);

    let progressColor = '#263041';
    if (isOverspent) {
      progressColor = 'red';
    } else if (percentSpent > 80) {
      progressColor = 'orange';
    }

    return (
      <Card style={styles.subCard} onPress={onPress}>
        <Card.Content>
          <View style={styles.subHeaderRow}>
            <Text style={styles.subCardTitle}>{budget.budgetName}</Text>
            <View style={styles.subActionButtons}>

              <Button 
              compact 
              onPress={onEdit}
              textColor={modalButtonText}
              >
                Edit
              </Button>

              {budget.budgetName !== 'Accommodation' && budget.budgetName !== 'Flights' && (
                <Button 
                compact 
                icon="delete" 
                onPress={onDelete} 
                textColor={modalButtonText}/>
              )}

              
            </View>
          </View>
          <Text style={styles.subBudgetTotal}>£{total.toFixed(2)}</Text>
          <Text style={styles.subTitle}>Spent: £{spent.toFixed(2)} ({percentSpent}%)</Text>
          <ProgressBar 
            progress={progress} 
            color={progressColor} 
            style={styles.subProgressBar} 
          />
        </Card.Content>
      </Card>
    );
  }
}

const styles = StyleSheet.create({
  // Total Card ----------------------------------------------------------------------------
  totalCardWrapper: {
    maxWidth: '100%',
    marginBottom: 10,
    marginTop: 10,
  },
  totalCard: {
    marginHorizontal: 4,
    paddingVertical: 8,
    borderColor: '#263041',
    borderWidth: 1,
    borderRadius: 3,
    backgroundColor: 'white',
  },
  totalCardTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  totalChartWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  totalCenterTextWrapper: {
    position: 'absolute',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalCenterText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  totalSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  totalSubText: {
    fontSize: 12,
    color: '#666',
  },

  // Sub Cards -------------------------------------------------------------------------------
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
