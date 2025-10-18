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
  getIcon={(h) => h.customIcon || null || 'the name of the icon'} // null means fallback to title-based icon
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
  };

  const getAutoIconFromTitle = (title) => {
    if (!title) return 'information-outline';
    const lower = title.toLowerCase();

    for (const keyword in iconKeywordMap) {
      if (lower.includes(keyword)) {
        return iconKeywordMap[keyword];
      }
    }

    return 'information-outline';
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
            <Card.Title
              title={
                <View style={styles.titleRow}>
                  <Text style={styles.titleText}>{title}</Text>
                  {getSubtitle(item) ? (
                    <Text style={styles.subtitleText}> — {getSubtitle(item)}</Text>
                  ) : null}
                </View>
              }
              subtitle={getDetail(item)}
              left={(props) => (
                <View style={styles.leftContent}>
                  <Avatar.Icon
                    {...props}
                    icon={icon}
                    color={'rgb(52, 72, 104)'}
                    style={styles.avatarBackground}
                  />
                </View>
              )}
      
              right={(props) =>
                getRight(item) ? (
                  <Text
                    style={[
                      styles.rightContent,
                      ]}>
                        
                    {getRight(item)}
                  </Text>
                ) : null
              }
            />
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    marginTop: 8,
    // Removed paddingHorizontal here so cards can extend to container edges
  },
  card: {
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  titleText: {
    fontWeight: '600',
    fontSize: 16,
    color: 'rgb(52, 72, 104)',
  },
  subtitleText: {
    marginLeft: 4,
    color: 'rgb(136, 136, 136)',
    fontSize: 14,
    fontWeight: '400',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgb(136, 136, 136)',
    marginTop: 2,
  },
  rightContent: {
    marginRight: 16,
    fontSize: 15,
    fontWeight: 'bold',
    color: 'rgb(52, 72, 104)',
    alignSelf: 'center',
  },
  leftContent: {
    alignSelf: 'center',
  },
  avatarBackground: {
    backgroundColor: 'rgb(244, 241, 235)',
  },
});