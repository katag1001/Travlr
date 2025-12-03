import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

const themeBackgroundMap = {
  'Africa': require('../assets/images/backgrounds/africa.png'),
  'Central Asia': require('../assets/images/backgrounds/central_asia.png'),
  'Middle East': require('../assets/images/backgrounds/middle_east.png'),
  'Europe': require('../assets/images/backgrounds/europe.png'),
  'North America': require('../assets/images/backgrounds/north_america.png'),
  'Southeast Asia': require('../assets/images/backgrounds/sea.png'),
  'South America': require('../assets/images/backgrounds/south_america.png'),
  'Travel': require('../assets/images/backgrounds/travel.png'),
};

const defaultImage = require('../assets/images/backgrounds/travel.png');

export default function Background({ theme, children }) {
  const bg = themeBackgroundMap[theme] || defaultImage;

  return (
    <ImageBackground source={bg} style={styles.image} resizeMode="cover">
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
  },
});
