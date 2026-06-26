import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>AICT EMS</Text>
      <Text style={styles.sub}>App is working!</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 48,
    fontWeight: '900',
    color: 'white',
  },
  sub: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 12,
  },
});
