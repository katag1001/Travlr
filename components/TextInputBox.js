import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

const TextInputBox = ({ style, ...props }) => {
  return (
    <TextInput
      mode="outlined"
      style={[styles.input, style]}
      placeholderTextColor='#263041'
      textColor='#263041'
      outlineColor='#263041'
      activeOutlineColor='#263041'
      selectionColor='#263041'
      theme={{
        colors: {
          primary: '#263041', 
          background: 'white',
          text: '#263041', 
          placeholder: '#263041', 
        },
      }}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'white',
    marginBottom: 12,
  },
});

export default TextInputBox;
