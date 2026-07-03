import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../src/shared/query/query-client';
import { useDesktopLaunchBridge } from '../src/shared/bridge/desktop-launch-bridge';
import { MobileSessionBootstrap } from '../src/modules/auth/MobileSessionBootstrap';

function DesktopBridgeMount() {
  useDesktopLaunchBridge();
  return null;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <DesktopBridgeMount />
      <MobileSessionBootstrap>
        <GestureHandlerRootView style={styles.root}>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }} />
        </GestureHandlerRootView>
      </MobileSessionBootstrap>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
