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
import { lerSaidaGovbr, useUrlRetornoGovbr, useRetornoGovbrPendente, SaidaGovbr } from './govbr/link';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { LayoutProvider, MolduraSegura, useLayout } from './contexts/layout-context';
import { arquivosDasFontes } from './ui/tema';

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

import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { cores, fontes } from './ui/tema';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Os componentes do Paper que sobraram (diálogo, aviso de erro) seguem as
// cores e a fonte da identidade — ver `ui/tema`.
const theme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: { fontFamily: fontes.regular } }),
  colors: {
    ...MD3LightTheme.colors,
    primary: cores.azul,
    background: cores.chao,
    surface: cores.papel,
    onSurface: cores.grafite,
    outline: cores.linha,
    onSurfaceVariant: cores.textoSecundario,
    error: cores.erro,
  },
};

export default function Main() {
  const [fontsLoaded] = Font.useFonts({
    'HankenGrotesk': require('../assets/fonts/HankenGrotesk-Variable.ttf'),
    ...arquivosDasFontes,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider style={{ flex: 1 }} initialMetrics={initialWindowMetrics}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* Acompanha o teclado no aplicativo (na web não faz nada) — ver
            `components/ScrollComTeclado.tsx`. Fica acima do PaperProvider
            para valer também nos diálogos, que renderizam no Portal dele. */}
        <KeyboardProvider>
          <PaperProvider theme={theme}>
            <GlobalToastProvider>
              <QueryClientProvider client={queryClient}>
                <ORPCProvider>
                  <AuthProvider>
                    <QRCodeReaderProvider>

                      {/* A moldura faz o papel do SafeAreaView, com a cor de
                          cada tela nas faixas do sistema — ver layout-context. */}
                      <LayoutProvider>
                        <MolduraSegura corPadrao={theme.colors.background}>
                          <App />
                        </MolduraSegura>
                      </LayoutProvider>

                    </QRCodeReaderProvider>
                  </AuthProvider>
                </ORPCProvider>
              </QueryClientProvider>
            </GlobalToastProvider>
          </PaperProvider>
        </KeyboardProvider>
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
  // Cada retorno é tratado uma única vez, mesmo entre reaberturas do app —
  // ver `useRetornoGovbrPendente`, que explica por quê.
  const urlRetorno = useUrlRetornoGovbr();
  const [retornoGovbr, concluirRetornoGovbr] = useRetornoGovbrPendente(urlRetorno);

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
              onConcluir={concluirRetornoGovbr}
            />
          )
          : <Navigation />}
    </View>
  );
}
