import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
};

export type MainStackParamList = {
  Swiper: undefined;
  Profile: undefined;
  EditProfile: undefined;
  BusinessDetails: { id: string };
  Chat: { matchId: string };
  Filters: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
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