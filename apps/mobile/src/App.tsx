import * as React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { PaperProvider, Snackbar, useTheme } from 'react-native-paper';
import * as Font from 'expo-font';
import { ORPCProvider } from './locomotiva-api/provider';
import { QueryClientProvider, QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { AuthProvider } from './contexts/auth-context';
import { CheckinProvider } from './contexts/checkin-context';
import { QRCodeReaderProvider } from './contexts/qr-code-reader';
import Navigation from './navigation';
import GovbrCallbackScreen from './screens/public/GovbrCallbackScreen';
import GovbrSaidaScreen from './screens/public/GovbrSaidaScreen';
import { lerRetornoGovbr, lerSaidaGovbr, useUrlRetornoGovbr, RetornoGovbr, SaidaGovbr } from './govbr/link';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LayoutProvider, useLayout } from './contexts/layout-context';

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
  const [fontsLoaded] = Font.useFonts({
    'HankenGrotesk': require('../assets/fonts/HankenGrotesk-Variable.ttf'),
  });

  if (!fontsLoaded) return null;

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
                      <LayoutProvider>
                        <App />
                      </LayoutProvider>
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



const MAX_WIDTH = 800;

function App() {
  const { width } = useWindowDimensions();
  const { fullBleed } = useLayout();
  const isWide = width > MAX_WIDTH;

  // O retorno do gov.br é tratado ANTES do React Navigation. O `linking` dele
  // tem prefixos fixos que não cobrem o domínio de produção nem o esquema do
  // app, então ele descartaria a URL e voltaria para a tela inicial — levando
  // o `code` junto. Na web a URL é a da própria página; no aplicativo é o link
  // do app que o (re)abriu, ou o resultado da sessão de login.
  const urlRetorno = useUrlRetornoGovbr();
  const [retornoGovbr, setRetornoGovbr] = React.useState<RetornoGovbr | null>(
    () => lerRetornoGovbr(urlRetorno)
  );
  const ultimaUrlTratada = React.useRef<string | null>(urlRetorno);
  React.useEffect(() => {
    if (!urlRetorno || urlRetorno === ultimaUrlTratada.current) return;
    ultimaUrlTratada.current = urlRetorno;
    const retorno = lerRetornoGovbr(urlRetorno);
    if (retorno) setRetornoGovbr(retorno);
  }, [urlRetorno]);

  // Saída do gov.br, só na web: a página que o app abre para encerrar a
  // sessão lá, ou a home aberta na volta do gov.br com a marca de "voltar ao
  // app". Também antes do React Navigation, pelo mesmo motivo acima.
  const [saidaGovbr] = React.useState<SaidaGovbr | null>(() => lerSaidaGovbr(urlRetorno));

  // Telas "full bleed" (ex.: EntradaScreen) ocupam a viewport inteira e
  // centralizam o próprio conteúdo; as demais ficam limitadas a MAX_WIDTH.
  return (
    <View style={[
      { flex: 1, alignSelf: 'center', width: '100%' },
      !fullBleed && { maxWidth: MAX_WIDTH },
      !fullBleed && isWide && { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'lightgray' },
    ]}>
      {saidaGovbr
        ? <GovbrSaidaScreen modo={saidaGovbr} />
        : retornoGovbr
          ? (
            <GovbrCallbackScreen
              key={retornoGovbr.state ?? 'sem-state'}
              retorno={retornoGovbr}
              onConcluir={() => setRetornoGovbr(null)}
            />
          )
          : <Navigation />}
    </View>
  );
}
