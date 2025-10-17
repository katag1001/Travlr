// components/Banner.js
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const themeImageMap = {
  'North America': require('../assets/images/banners/north_america.png'),
  'South America': require('../assets/images/banners/south_america.png'),
  'Indian Subcontinent': require('../assets/images/banners/india.png'),
  'Southeast Asia': require('../assets/images/banners/se_asia.png'),
  'East Asia': require('../assets/images/banners/east_asia.png'),
  'Oceania': require('../assets/images/banners/oceania.png'),
  'Africa': require('../assets/images/banners/africa.png'),
  'Middle East': require('../assets/images/banners/middle_east.png'),
  'Russia': require('../assets/images/banners/russia.png'),
  'Europe': require('../assets/images/banners/europe.png'),
  'Central Asia': require('../assets/images/banners/central_asia.png'),
};

export default function Banner({ theme }) {
  if (!theme || !themeImageMap[theme]) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Image source={themeImageMap[theme]} style={styles.image} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
  },
});
