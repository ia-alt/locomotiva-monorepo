import * as React from 'react';
import { PaperProvider, Snackbar, useTheme } from 'react-native-paper';
import { ORPCProvider } from './locomotiva-api/provider';
import { QueryClientProvider, QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { AuthProvider } from './contexts/auth-context';
import { CheckinProvider } from './contexts/checkin-context';
import { QRCodeReaderProvider } from './contexts/qr-code-reader';
import Navigation from './navigation';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Sistema de Toast Global acessível fora do fluxo do React
type ToastShow = (message: string) => void;
let showToastGlobal: ToastShow | null = null;

export const showToast = (message: string) => {
  if (showToastGlobal) showToastGlobal(message);
};

function GlobalToastProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const [visible, setVisible] = React.useState(false);
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    showToastGlobal = (msg: string) => {
      setMessage(msg);
      setVisible(true);
    };
    return () => {
      showToastGlobal = null;
    };
  }, []);

  return (
    <>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={Snackbar.DURATION_SHORT}
        style={{ backgroundColor: theme.colors.error }}
        wrapperStyle={{ top: 50 }}
      >
        {message}
      </Snackbar>
    </>
  );
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error('Global Query Error:', error);
      showToast(error instanceof Error ? error.message : 'Ocorreu um erro ao buscar os dados.');
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, variables, context, mutation) => {
      console.error('Global Mutation Error:', error);
      showToast(error instanceof Error ? error.message : 'Ocorreu um erro na operação.');
    },
  }),
});

import { MD3LightTheme } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1A7BFF',
    background: '#F3F6FA',
    surface: '#FFFFFF',
    onSurface: '#1E293B',
    outline: '#CBD5E1',
    onSurfaceVariant: '#94A3B8',
  },
};

export default function Main() {
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider theme={theme}>
          <GlobalToastProvider>
            <QueryClientProvider client={queryClient}>
              <ORPCProvider>
                <AuthProvider>
                  <QRCodeReaderProvider>

                    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
                      <App />
                    </SafeAreaView>

                  </QRCodeReaderProvider>
                </AuthProvider>
              </ORPCProvider>
            </QueryClientProvider>
          </GlobalToastProvider>
        </PaperProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}



function App() {
  return <Navigation />;
}
