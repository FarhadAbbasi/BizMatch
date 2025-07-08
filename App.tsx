import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-url-polyfill/auto';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './navigation/RootNavigator';
import './global.css';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}




// import 'react-native-gesture-handler';
// import 'react-native-reanimated';
// import { enableScreens } from 'react-native-screens';
// enableScreens();
// import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
// import Home from './screens/Home';
// import './global.css';


// export default function App() {
//   return (
//     <>
//       <SafeAreaProvider>
//         <SafeAreaView style={{ flex: 1 }}>
//           <Home />
//         </SafeAreaView>
//       </SafeAreaProvider>
//     </>
//   );
// }

