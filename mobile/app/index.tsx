// mobile/app/index.tsx
import { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { bootstrapAuth } from '../src/lib/auth';
import { fetchMe } from '../src/lib/api';
import { setProfile } from '../src/lib/session';

export default function Gate() {
  const r = useRouter();

  useEffect(() => {
    (async () => {
      const ok = await bootstrapAuth();
      if (ok) {
        try {
          const me = await fetchMe();
          setProfile(me);
        } catch {}
        r.replace('/(app)');
      } else {
        r.replace('/(auth)/login');
      }
    })();
  }, [r]);

  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center', gap:8 }}>
      <ActivityIndicator />
      <Text>Launching…</Text>
    </View>
  );
}
