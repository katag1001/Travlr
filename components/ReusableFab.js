import React from 'react';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';


export default function ReusableFab({ icon = "plus", label, onPress, disabled }) {
  return (
    <FAB
      icon={icon}
      label={label}
      onPress={onPress}
      disabled={disabled}
      color='#263041'
      style={styles.fab}
    />
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 25,
    backgroundColor: 'white',
    borderColor: '#263041',
    borderWidth: 1,
    borderRadius: 3,
    //Text color goes inside the fab itself for some reason
  },
});
