import 'react-native-url-polyfill/auto';
import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './navigation/RootNavigator';
import { ThemeProvider } from './theme/ThemeProvider';
import { supabase } from './services/supabase';
import { useSession } from './stores/useSession';
import './global.css';

export default function App() {
  const { setUser, setOnboardingComplete } = useSession();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        // Check if user has completed onboarding
        supabase
          .from('business_profiles')
          .select('id')
          .eq('owner_uid', session.user.id)
          .single()
          .then(({ data }) => {
            setOnboardingComplete(!!data);
          });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setOnboardingComplete(false);
      }
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


