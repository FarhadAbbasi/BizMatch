import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { enableScreens } from 'react-native-screens';
enableScreens();
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Home from './screens/Home';
import './global.css';


export default function App() {
  return (
    <SafeAreaProvider>
    <SafeAreaView style={{ flex: 1 }}>
      <Home />
    </SafeAreaView>
    </SafeAreaProvider>
  );
}





// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View } from 'react-native';

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.tsx to start working on your app!</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
