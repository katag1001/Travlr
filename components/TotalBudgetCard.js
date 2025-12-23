import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import PieChart from 'react-native-pie-chart';

export default function TotalBudgetCard({ total, spent, title = "Total Budget" }) {
  const remaining = Math.max(total - spent, 0);
  const widthAndHeight = 120;

  const isEmpty = spent === 0 && total === 0;
  const isOverspent = spent > total;

  let series;
  if (isEmpty) {
    series = [{ value: 1, color: '#ccdffeff' }];
  } else if (isOverspent) {
    series = [{ value: 1, color: 'red' }];
  } else {
    series = [
      { value: remaining, color: '#ccdffeff' },
      { value: spent, color: '#263041' },
    ];
  }

  return (
    <Card style={[styles.totalCard, styles.totalCardWrapper]}>
      <Card.Title title={title} titleStyle={styles.totalCardTitle} />
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
}

const styles = StyleSheet.create({
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
});
