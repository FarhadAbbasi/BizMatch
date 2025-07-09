import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type MainTabParamList = {
  SwiperTab: undefined;
  FiltersTab: undefined;
  ChatsTab: undefined;
  ProfileTab: undefined;
};

export type MainStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  BusinessDetails: { id: string };
  EditProfile: undefined;
  ChatList: undefined;
  Chat: { matchId: string; businessId: string };
};

export type MainStackScreenProps<T extends keyof MainStackParamList> = 
  NativeStackScreenProps<MainStackParamList, T>;

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> = {
  navigation: any;
  route: any;
};

export type MainScreenProps<T extends keyof MainStackParamList> = {
  navigation: any;
  route: any;
};

export type RootScreenProps<T extends keyof RootStackParamList> = {
  navigation: any;
  route: any;
}; 