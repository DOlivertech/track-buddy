// index.tsx
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  window.__EXPO_ROUTER_BASE_PATH__ = '/track-buddy';
}

const ctx = require.context('./app');

export default function App() {
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
