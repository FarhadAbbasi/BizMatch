import 'react-native-url-polyfill/auto';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './navigation/RootNavigator';
import { supabase } from './services/supabase';
import { useSession } from './stores/useSession';
import { ThemeProvider } from './theme/ThemeProvider';
import './global.css';

export default function App() {
  const { setUser } = useSession();

  useEffect(() => {
    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootNavigator />
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


