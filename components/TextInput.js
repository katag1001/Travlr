import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

const AppTextInput = ({ style, ...props }) => {
  return (
    <TextInput
      mode="outlined"
      style={[styles.input, style]} // merge any extra style passed
      placeholderTextColor="purple"
      textColor="lime"
      outlineColor="red"
      activeOutlineColor="blue"
      selectionColor="yellow"
      theme={{
        colors: {
          primary: 'orange', // focused label & border
          background: 'pink', // input background
          text: 'lime', // input text
          placeholder: 'purple', // placeholder
        },
      }}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'pink',
    marginBottom: 12,
  },
});

export default AppTextInput;
