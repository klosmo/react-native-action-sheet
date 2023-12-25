import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import { App } from './src';

const AppContainer = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <App />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// eslint-disable-next-line import/no-default-export
export default AppContainer;
