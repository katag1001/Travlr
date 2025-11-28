import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Avatar, IconButton } from 'react-native-paper';

export default function ViewCard({
  data = [],
  onPressItem = () => {},
  getTitle = () => '',
  getSubtitle = () => '',
  getDetail = () => '',
  getRight = () => '',
  getIcon = null,
  deleteItem = null, // optional delete function
}) {
  const iconKeywordMap = {
    hotel: 'bed',
    accommodation: 'bed',
    dinner: 'silverware-fork-knife',
    meal: 'silverware-fork-knife',
    flight: 'airplane',
    airport: 'airplane',
    car: 'car',
    rental: 'car',
    activity: 'map-marker',
    tour: 'map-marker',
    train: 'train',
    bus: 'bus',
    boat: 'ferry',
    ferry: 'ferry',
    event: 'calendar',
    conference: 'account-group',
    meeting: 'account-tie',
    museum: 'palette',
    restaurant: 'silverware',
    breakfast: 'food-croissant',
    beach: 'beach',
    hiking: 'hiking',
    mountain: 'terrain',
    park: 'tree',
    shopping: 'shopping',
    spa: 'spa',
    bar: 'glass-cocktail',
    nightlife: 'music',
    wifi: 'wifi',
    luggage: 'briefcase',
    passport: 'passport',
    weather: 'weather-partly-cloudy',
    map: 'map',
    guide: 'account-voice',
    ticket: 'ticket-confirmation',
    gallery: 'palette',
    landmark: 'office-building',
    camping: 'tent',
    swimming: 'pool',
    taxi: 'taxi',
  };

  const getAutoIconFromTitle = (title) => {
    if (!title) return 'passport';
    const lower = title.toLowerCase();
    for (const keyword in iconKeywordMap) {
      if (lower.includes(keyword)) {
        return iconKeywordMap[keyword];
      }
    }
    return 'passport';
  };

  return (
    <View style={styles.list}>
      {data.map((item, index) => {
        const title = getTitle(item);
        const icon = typeof getIcon === 'function'
          ? getIcon(item) || getAutoIconFromTitle(title)
          : getAutoIconFromTitle(title);

        return (
          <Card key={item.id || index} style={styles.card}>
            <TouchableOpacity onPress={() => onPressItem(item)}>
              <View style={styles.cardContent}>
                {/* Left icon */}
                <Avatar.Icon
                  icon={icon}
                  color={'#263041'}
                  style={styles.avatarBackground}
                  size={40}
                />

                {/* Main text */}
                <View style={styles.textContainer}>
                  <View style={styles.titleRow}>
                    <Text style={styles.titleText}>{title}</Text>
                    {getSubtitle(item) ? (
                      <Text style={styles.subtitle1}>{getSubtitle(item)}</Text>
                    ) : null}
                  </View>
                  {getDetail(item) ? (
                    <Text style={styles.subtitle2}>{getDetail(item)}</Text>
                  ) : null}
                </View>

                {/* Top-right content (cost/label) */}
                {getRight(item) ? (
                  <Text style={styles.rightContent}>{getRight(item)}</Text>
                ) : null}

                {/* Bottom-right delete button */}
                {deleteItem && (
                  <IconButton
                    icon="delete"
                    size={20}
                    color="red"
                    style={styles.deleteButton}
                    onPress={() => deleteItem(item)}
                  />
                )}
              </View>
            </TouchableOpacity>
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: 8 },
  card: {
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: '#f4f1ea',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: 70,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    position: 'relative',
  },
  avatarBackground: { backgroundColor: '#ece9e2' },
  textContainer: { flex: 1, marginLeft: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' },
  titleText: { fontWeight: '650', fontSize: 16, color: '#263041', marginRight: 8 },
  subtitle1: { fontSize: 13, color: '#5c5f62', fontWeight: '400' },
  subtitle2: { fontSize: 12, color: '#5c5f62', marginTop: 2 },
  rightContent: {
    position: 'absolute',
    top: 16,
    right: 16,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#263041',
  },
  deleteButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
});
