import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const App = () => {
  return (
    <View style={[styles.container, { flex: 1 }]}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export { App };
