import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import RootNavigator from './navigation/RootNavigator';
import { useSession } from './stores/useSession';

// Import global CSS only on web
if (Platform.OS === 'web') {
  require('./global.css');
}

export default function App() {
  const { init } = useSession();

  useEffect(() => {
    const unsub = init();
    return unsub;
  }, []);

  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}
