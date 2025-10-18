import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Avatar } from 'react-native-paper';

export default function ViewCard({
  data = [],
  onPressItem = () => {},
  getIcon = () => 'information',
  getTitle = () => '',
  getSubtitle = () => '',
  getDetail = () => '',
  getRight = () => '',
}) {
  return (
    <View style={styles.list}>
      {data.map((item, index) => (
        <Card key={item.id || index} style={styles.card} onPress={() => onPressItem(item)}>
          <Card.Title
            title={
              <View style={styles.titleRow}>
                <Text style={styles.titleText}>{getTitle(item)}</Text>
                {getSubtitle(item) ? (
                  <Text style={styles.subtitleText}> — {getSubtitle(item)}</Text>
                ) : null}
              </View>
            }
            subtitle={getDetail(item)}
            left={(props) =>
              <Avatar.Icon
                {...props}
                icon={getIcon(item) || 'information'}
              />
            }
            right={(props) =>
              getRight(item) ? (
                <Text style={styles.rightContent}>{getRight(item)}</Text>
              ) : null
            }
          />
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    marginTop: 8,
  },
  card: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  subtitleText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
  rightContent: {
    marginRight: 16,
    fontSize: 14,
    color: '#444',
    alignSelf: 'center',
  },
});
