import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

const themeBackgroundMap = {
  'Africa': require('../assets/images/backgrounds/africa2.jpg'),
  'Central Asia': require('../assets/images/backgrounds/central_asia2.jpg'),
  'Middle East': require('../assets/images/backgrounds/middle_east2.jpg'),
  'Europe': require('../assets/images/backgrounds/europe2.jpg'),
  'North America': require('../assets/images/backgrounds/north_america2.jpg'),
  'Southeast Asia': require('../assets/images/backgrounds/sea2.jpg'),
  'South America': require('../assets/images/backgrounds/south_america2.jpg'),
  'East Asia': require('../assets/images/backgrounds/east_asia2.jpg'),
  'Indian Subcontinent': require('../assets/images/backgrounds/indian_subcontinent2.jpg'),
  'Travel': require('../assets/images/backgrounds/general2.jpg'),
};

const defaultImage = require('../assets/images/backgrounds/general2.jpg');

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
