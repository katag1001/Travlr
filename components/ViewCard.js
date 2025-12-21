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
  deleteItem = null, 
}) {
  const iconKeywordMap = {
  // Accommodation & transport
  hotel: 'bed',
  accommodation: 'bed',
  hostel: 'bed-bunk',
  apartment: 'home-city',
  flight: 'airplane',
  airport: 'airplane',
  airline: 'airplane',
  train: 'train',
  bus: 'bus',
  subway: 'subway-variant',
  metro: 'subway-variant',
  tram: 'tram',
  boat: 'ferry',
  ferry: 'ferry',
  car: 'car',
  rental: 'car',
  taxi: 'taxi',
  rideshare: 'car-hatchback',
  parking: 'parking',

  // Food & dining
  dinner: 'silverware-fork-knife',
  meal: 'silverware-fork-knife',
  restaurant: 'silverware',
  breakfast: 'food-croissant',
  lunch: 'food',
  cafe: 'coffee',
  coffee: 'coffee',
  bar: 'glass-cocktail',
  nightlife: 'music',

  // Activities & places
  activity: 'map-marker',
  tour: 'map-marker',
  event: 'calendar',
  conference: 'account-group',
  meeting: 'account-tie',
  museum: 'palette',
  gallery: 'palette',
  landmark: 'office-building',
  park: 'tree',
  beach: 'beach',
  hiking: 'hiking',
  mountain: 'terrain',
  camping: 'tent',
  swimming: 'pool',
  snorkeling: 'diving-snorkel',
  diving: 'diving-scuba',
  shopping: 'shopping',
  spa: 'spa',
  gym: 'dumbbell',

  // Travel essentials
  luggage: 'briefcase',
  suitcase: 'bag-suitcase',
  backpack: 'bag-personal',
  passport: 'passport',
  visa: 'card-account-details',
  ticket: 'ticket-confirmation',
  boardingpass: 'ticket',
  insurance: 'shield-check',
  wallet: 'wallet',
  money: 'cash',
  currency: 'currency-usd',
  map: 'map',
  guide: 'account-voice',
  wifi: 'wifi',
  sim: 'sim',
  charger: 'battery-charging',
  adapter: 'power-plug',

  // Packing list – toiletries
  toiletries: 'toothbrush-paste',
  toothbrush: 'toothbrush',
  toothpaste: 'toothbrush-paste',
  shampoo: 'bottle-tonic',
  conditioner: 'bottle-tonic-outline',
  soap: 'soap',
  deodorant: 'spray',
  razor: 'razor-double-edge',
  sunscreen: 'weather-sunny',
  skincare: 'face-man',

  // Packing list – clothing
  clothes: 'tshirt-crew',
  shirt: 'tshirt-crew',
  pants: 'tshirt-v',
  jeans: 'tshirt-v',
  jacket: 'jacket',
  coat: 'coat-rack',
  shoes: 'shoe-sneaker',
  sandals: 'shoe-sandal',
  socks: 'socks',
  underwear: 'hanger',
  pajamas: 'sleep',
  swimsuit: 'swim',
  hat: 'hat-fedora',
  scarf: 'scarf',
  gloves: 'gloves',

  // Weather & timing
  weather: 'weather-partly-cloudy',
  rain: 'weather-rainy',
  snow: 'weather-snowy',
  sunny: 'weather-sunny',
  time: 'clock-outline',
  calendar: 'calendar',
};


  const getAutoIconFromTitle = (title) => {
    if (!title) return 'briefcase';
    const lower = title.toLowerCase();
    for (const keyword in iconKeywordMap) {
      if (lower.includes(keyword)) {
        return iconKeywordMap[keyword];
      }
    }
    return 'briefcase';
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
                
                <Avatar.Icon
                  icon={icon}
                  color={'#263041'}
                  style={styles.avatarBackground}
                  size={40}
                />

                
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

                
                {getRight(item) ? (
                  <Text style={styles.rightContent}>{getRight(item)}</Text>
                ) : null}

                
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
    borderRadius: 3,
    backgroundColor: 'white',
    elevation: 2,
    minHeight: 70,
    marginHorizontal: 4,
    borderColor: '#263041',
    borderWidth: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 18,
    position: 'relative',
  },
  avatarBackground: { backgroundColor: '#ccdffeff' },
  textContainer: { flex: 1, marginLeft: 12,  paddingRight: 60 },
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
    bottom: 0,
    right: 0,
  },
});
