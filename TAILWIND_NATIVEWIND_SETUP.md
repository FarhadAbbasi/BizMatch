# Tailwind / NativeWind configuration guide for this Expo project

> Use this as a quick reference whenever you need to wire Tailwind into a fresh Expo SDK 53 app.

---

## 1  Dependencies

```bash
# runtime
npm install nativewind

# dev-time
npm install -D tailwindcss
```

NativeWind already pulls in `react-native-css-interop` and other peer deps when required.

---

## 2  `babel.config.js`

```js
module.exports = function (api) {
  api.cache(true);
  return {
    // Expo preset with jsxImportSource patched so TS/JSX knows about NativeWind
    // then the NativeWind preset *itself* (it is NOT a plugin).
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
```

Why?
* `nativewind/babel` is a **preset** (not a plugin) that bundles:
  * `react-native-css-interop` JSX transform
  * Reanimated plugin (if present)

---

## 3  `metro.config.js`

```js
// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// `input` points to a Tailwind CSS file that will be compiled for web
module.exports = withNativeWind(config, { input: './global.css' });
```

---

## 4  `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // 👇 NativeWind preset gives React Native-friendly defaults
  presets: [require('nativewind/preset')],
  content: [
    './App.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: { extend: {} },
  plugins: [],
};
```

---

## 5  TypeScript tweaks (`tsconfig.json`)

```jsonc
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "jsxImportSource": "nativewind" // 👈 so TS picks up the JSX pragma
  }
}
```

Add ambient types so `className` is recognised:

```ts
// nativewind.d.ts
/// <reference types="nativewind/types" />
```

---

## 6  Global CSS for web (`global.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Import it **only** on web to avoid breaking native packs:

```tsx
// App.tsx
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  require('./global.css');
}
```

---

## 7  Example component

```tsx
// screens/Home.tsx
import { View, Text, TouchableOpacity } from 'react-native';

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-3xl font-bold text-blue-600">Welcome to BizMatch</Text>
      <TouchableOpacity className="mt-4 bg-blue-500 px-4 py-2 rounded">
        <Text className="text-white">Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## 8  Restart Metro after any config change

Always restart with cache cleared:

```bash
npx expo start -c
```

---

🎉  You now have Tailwind utilities available in React Native and on the web via NativeWind. 

---

## 9  React-Native entry-point initialisation (mobile only)

Expo Go (and any native build) expects certain side-effect imports **before** React Native starts:

1. `react-native-gesture-handler` – must be the first import.
2. `react-native-reanimated` – registers the worklet runtime.
3. `react-native-screens` – optional but recommended performance boost (and required by React-Navigation v7). Call `enableScreens()` immediately after importing.

Put these at the very top of your **entry file** (usually `index.js`/`index.ts`) *before* any other imports:

```ts
// index.ts – entry point
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { enableScreens } from 'react-native-screens';
enableScreens();

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
```

Avoid duplicating these imports elsewhere; once at the entry point is enough. They do **nothing** on web, so your browser build remains unaffected.

Remember to restart Metro with cache cleared after adding them: `npx expo start -c`. 