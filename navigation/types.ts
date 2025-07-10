import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  CreateProfile: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  BusinessDetails: { id: string };
  EditProfile: undefined;
  Chat: { matchId: string };
};

export type MainTabParamList = {
  SwiperTab: undefined;
  FiltersTab: undefined;
  ChatsTab: undefined;
  ProfileTab: undefined;
};

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
export type MainScreenProps<T extends keyof MainStackParamList> = NativeStackScreenProps<MainStackParamList, T>;
export type TabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<MainTabParamList, T>; 