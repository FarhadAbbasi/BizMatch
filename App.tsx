import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { enableScreens } from 'react-native-screens';
enableScreens();
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Home from './screens/Home';
import './global.css';
import 'react-native-url-polyfill/auto';


export default function App() {
  return (
    <SafeAreaProvider>
    <SafeAreaView style={{ flex: 1 }}>
      <Home />
    </SafeAreaView>
    </SafeAreaProvider>
  );
}



