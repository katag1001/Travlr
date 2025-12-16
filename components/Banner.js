/* NOT IN USE -------------------------------------
------------------------------------------------------------------------
----------------------------------------------------------------------------------------*/


import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import defaultImage from '../assets/images/banners/travel.png' 

const themeImageMap = {
  'South America': require('../assets/images/banners/south_america.png'),
  'Indian Subcontinent': require('../assets/images/banners/india.png'),
  'Southeast Asia': require('../assets/images/banners/se_asia.png'),
  'East Asia': require('../assets/images/banners/east_asia.png'),
  'Oceania': require('../assets/images/banners/oceania.png'),
  'Africa': require('../assets/images/banners/travel.png'),
  'Middle East': require('../assets/images/banners/middle_east.png'),
  'Russia': require('../assets/images/banners/russia.png'),
  'Europe': require('../assets/images/banners/europe.png'),
  'Central Asia': require('../assets/images/banners/central_asia.png'),
};

export default function Banner({ theme }) {
  const imageSource = themeImageMap[theme] || defaultImage;
  const [aspectRatio, setAspectRatio] = useState(null);

  useEffect(() => {
    let isMounted = true;

    if (typeof imageSource === 'number') {
      const resolved = Image.resolveAssetSource(imageSource);
      if (resolved && resolved.width && resolved.height && isMounted) {
        setAspectRatio(resolved.width / resolved.height);
      }
      return () => { isMounted = false; };
    }

    const uri = imageSource?.uri;
    if (uri) {

      Image.getSize(
        uri,
        (width, height) => { if (isMounted) setAspectRatio(width / height); },
        (err) => {

          console.warn('Image.getSize failed for', uri, err);
          if (isMounted) setAspectRatio(16 / 9);
        }
      );
    } else {
      setAspectRatio(16 / 9);
    }

    return () => { isMounted = false; };
  }, [imageSource]);

  return (
    <View style={styles.container}>
      {aspectRatio ? (
        <Image
          source={imageSource}
          style={[styles.image, { aspectRatio }]}
          resizeMode="contain"
        />
      ) : (

        <View style={{ width: '100%', height: 1 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    overflow: 'hidden',
        borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  image: {
    width: '100%',
    height: undefined,
  },
});