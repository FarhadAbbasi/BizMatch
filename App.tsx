import 'react-native-url-polyfill/auto';
import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { supabase } from './services/supabase';
import { ThemeProvider } from './theme/ThemeProvider';
import './global.css';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator session={session} />
      </ThemeProvider>
    </SafeAreaProvider>
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


