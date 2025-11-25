import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Avatar } from 'react-native-paper';

/* USE TO INSERT ---------------------------------------------------------------------------------------------
<ViewCard
  data={hotels}
  onPressItem={handleEdit}
  getTitle={(h) => h.hotelName}
  getSubtitle={(h) => h.hotelPlace}
  getDetail={(h) => `${h.startDate} → ${h.endDate}`}
  getRight={(h) => h.cost ? `£${h.cost}` : ''}
  getIcon={(h) => h.customIcon || null || 'the name of the icon'} 
/>
-------------------------------------------------------------------------------------------------------------*/


export default function ViewCard({
  data = [],
  onPressItem = () => {},
  getTitle = () => '',
  getSubtitle = () => '',
  getDetail = () => '',
  getRight = () => '',
  getIcon = null,
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
          <Card
  key={item.id || index}
  style={styles.card}
  onPress={() => onPressItem(item)}
>
  <View style={styles.cardContent}>
    <View style={styles.leftContent}>
      <Avatar.Icon
        icon={icon}
        color={'#263041'}
        style={styles.avatarBackground}
        size={40}
      />
    </View>

    <View style={styles.textContainer}>
      {/* Title + Subtitle 1 side by side */}
      <View style={styles.titleRow}>
        <Text style={styles.titleText}>{getTitle(item)}</Text>
        {getSubtitle(item) ? (
          <Text style={styles.subtitle1}>{getSubtitle(item)}</Text>
        ) : null}
      </View>

      {/* Subtitle 2 below */}
      {getDetail(item) ? (
        <Text style={styles.subtitle2}>{getDetail(item)}</Text>
      ) : null}
    </View>

    {/* Right-aligned content like cost */}
    {getRight(item) ? (
      <Text style={styles.rightContent}>{getRight(item)}</Text>
    ) : null}
  </View>
</Card>


        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    marginTop: 8,
  },
  card: {
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: '#f4f1ea',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  padding: 16,
},

leftContent: {
  alignSelf: 'center',
},

textContainer: {
  flex: 1,
  marginLeft: 12,
},

titleRow: {
  flexDirection: 'row',
  alignItems: 'baseline',
  flexWrap: 'wrap',
},

titleText: {
  fontWeight: '650',
  fontSize: 16,
  color: '#263041',
  marginRight: 8,
},

subtitle1: {
  fontSize: 13,
  color: '#5c5f62',
  fontWeight: '400',
},

subtitle2: {
  fontSize: 12,
  color: '#5c5f62',
  marginTop: 2,
},

rightContent: {
  alignSelf: 'center',
  marginLeft: 8,
  fontSize: 15,
  fontWeight: 'bold',
  color: '#263041',
},

avatarBackground: {
  backgroundColor: '#ece9e2',
},

});