# Supabase Setup for React Native / Expo

This guide documents the complete setup for integrating Supabase with a React Native/Expo project.

## Required Dependencies

Install these dependencies:

```bash
npm install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill react-native-dotenv
```

## Configuration Files

### 1. Environment Variables (.env)
Create a `.env` file in your project root:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

⚠️ Make sure to add `.env` to your `.gitignore` file!

### 2. TypeScript Declarations (env.d.ts)
Create `env.d.ts` in your project root:

```typescript
declare module '@env' {
  export const SUPABASE_URL: string;
  export const SUPABASE_ANON_KEY: string;
}
```

### 3. Babel Configuration (babel.config.js)
Update your babel.config.js to include the dotenv plugin:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      'react-native-reanimated/plugin',
      ["module:react-native-dotenv", {
        "moduleName": "@env",
        "path": ".env",
        "blacklist": null,
        "whitelist": null,
        "safe": false,
        "allowUndefined": true
      }],
    ],
  };
};
```

### 4. Supabase Client Setup (services/supabase.ts)
Create a `services/supabase.ts` file:

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

## Usage Example

Here's a basic example of using the Supabase client:

```typescript
// screens/Home.tsx or any component
import { supabase } from '../services/supabase';

const fetchData = async () => {
  try {
    const { data, error } = await supabase
      .from('your_table')
      .select('*')
      .limit(5);

    if (error) throw error;
    console.log('Data:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Important Notes

1. **Environment Variables**: 
   - Always restart your development server after changing environment variables
   - Use `npm run start -- --clear` to clear cache when testing env changes

2. **Security**:
   - Never commit your `.env` file to version control
   - Keep your Supabase keys secure
   - Use Row Level Security (RLS) in Supabase for data protection

3. **Troubleshooting**:
   - If environment variables aren't working, check babel.config.js
   - Make sure URL polyfill is imported before using Supabase
   - Verify AsyncStorage is properly configured

4. **TypeScript**:
   - Ensure all type declarations are in place
   - The env.d.ts file is crucial for TypeScript support

## Testing the Setup

You can test your Supabase connection with this code:

```typescript
const testSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('your_table')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Supabase error:', error);
      return;
    }

    console.log('Supabase is working! Data:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Additional Resources

- [Supabase Documentation](https://supabase.io/docs)
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [React Native dotenv](https://github.com/goatandsheep/react-native-dotenv) 