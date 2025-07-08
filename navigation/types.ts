import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type MainStackParamList = {
  Swiper: undefined;
  BusinessDetails: {
    businessId: string;
  };
  Filters: undefined;
  Chat: {
    matchId: string;
    businessId: string;
  };
  Profile: undefined;
  EditProfile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type MainScreenProps<T extends keyof MainStackParamList> = NativeStackScreenProps<
  MainStackParamList,
  T
>;

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>; 