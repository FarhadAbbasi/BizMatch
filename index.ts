import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { enableScreens } from 'react-native-screens';
enableScreens();

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
