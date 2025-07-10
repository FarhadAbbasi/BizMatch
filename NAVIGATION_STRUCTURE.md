# BizMatch Navigation Structure

## Navigation Tree

```
App (App.tsx)
├── RootNavigator (navigation/RootNavigator.tsx)
│   ├── AuthStack (When: !user)
│   │   ├── Login
│   │   ├── Register
│   │   ├── ForgotPassword
│   │   └── ResetPassword
│   │
│   ├── Onboarding (When: user && !hasProfile)
│   │   └── Single screen with skip/next functionality
│   │
│   └── MainStack (When: user && hasProfile)
│       ├── MainTabs
│       │   ├── SwiperTab (Default)
│       │   │   └── Shows business cards for matching
│       │   │
│       │   ├── FiltersTab
│       │   │   └── Filter settings for matches
│       │   │
│       │   ├── ChatsTab
│       │   │   └── List of matched businesses
│       │   │
│       │   └── ProfileTab
│       │       └── User's business profile
│       │
│       ├── BusinessDetails (Modal)
│       │   └── Detailed view of a business
│       │
│       ├── EditProfile (Modal)
│       │   └── Edit business profile form
│       │
│       └── Chat (Modal)
│           └── Individual chat with a match

```

## State-Based Navigation Logic

```
if (!user) {
    show AuthStack
} else if (!hasProfile) {
    show Onboarding
} else {
    show MainStack
}
```

## File Structure

```
navigation/
├── RootNavigator.tsx    # Main navigation container
├── AuthStack.tsx        # Authentication flow
├── MainStack.tsx        # Main app + bottom tabs
├── types.ts            # Navigation type definitions
└── utils/              # Navigation utilities

screens/
├── auth/
│   ├── SignIn.tsx
│   ├── SignUp.tsx
│   ├── ForgotPassword.tsx
│   └── ResetPassword.tsx
│
├── Onboarding.tsx
├── Swiper.tsx
├── Filters.tsx
├── ChatList.tsx
├── Chat.tsx
├── Profile.tsx
├── EditProfile.tsx
└── BusinessDetails.tsx
```

## Navigation State Management

```typescript
// RootNavigator State
const [user, setUser] = useState<User | null>(null);
const [hasProfile, setHasProfile] = useState<boolean>(false);

// Session Store (stores/useSession.ts)
interface SessionState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// Profile Check Flow
useEffect(() => {
  if (user) {
    checkProfile();
    subscribeToProfileChanges();
  }
}, [user]);
```

## Common Navigation Flows

1. **Authentication → Main App**
```
Login → Profile Check → (Onboarding or MainStack)
```

2. **Onboarding → Main App**
```
Onboarding → Create Profile → Auto-navigate to MainStack
```

3. **Main App Flows**
```
Swiper → Match → Chat
Profile → Edit Profile
ChatList → Chat
```

## Screen Props & Parameters

```typescript
// Navigation Types by Screen
type OnboardingProps = RootScreenProps<'Onboarding'>;
type AuthScreenProps = NativeStackScreenProps<AuthStackParamList>;
type MainScreenProps = NativeStackScreenProps<MainStackParamList>;
type TabScreenProps = CompositeScreenProps<BottomTabScreenProps, NativeStackScreenProps>;

// Common Parameters
BusinessDetails: { id: string }
Chat: { matchId: string; businessId: string }
MainTabs: { screen: keyof MainTabParamList }
``` 