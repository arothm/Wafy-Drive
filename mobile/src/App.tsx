import React, { useRef, useState, useCallback, useEffect } from 'react'
import { SafeAreaView, StatusBar, StyleSheet, View, Text, TouchableOpacity, BackHandler, ActivityIndicator, useColorScheme, Platform } from 'react-native'
import { WebView, WebViewNavigation } from 'react-native-webview'

const URL = 'https://wafy.life/drive/'
const APP_NAME = 'Wafy Drive'
const GOLD = '#F5BD02'

export default function App() {
  const webViewRef = useRef<WebView>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [canGoBack, setCanGoBack] = useState(false)
  const isDark = useColorScheme() === 'dark'

  const handleBack = useCallback(() => {
    if (canGoBack && webViewRef.current) { webViewRef.current.goBack(); return true }
    return false
  }, [canGoBack])

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', handleBack)
    return () => sub.remove()
  }, [handleBack])

  if (error) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: isDark ? '#0A0A0A' : '#FFF' }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={s.center}>
          <Text style={[s.errorTitle, { color: isDark ? '#FAFAFA' : '#171717' }]}>Connection Error</Text>
          <Text style={{ color: isDark ? '#A3A3A3' : '#525252', textAlign: 'center', marginBottom: 24 }}>Could not connect to Wafy.</Text>
          <TouchableOpacity style={[s.retryBtn, { backgroundColor: GOLD }]} onPress={() => { setError(false); setLoading(true) }}>
            <Text style={{ color: '#171717', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: isDark ? '#0A0A0A' : '#FFF' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {loading && <View style={[s.overlay, { backgroundColor: isDark ? '#0A0A0A' : '#FFF' }]}><ActivityIndicator size="large" color={GOLD} /><Text style={{ color: isDark ? '#A3A3A3' : '#525252', marginTop: 16, fontSize: 18, fontWeight: '600' }}>{APP_NAME}</Text></View>}
      <WebView ref={webViewRef} source={{ uri: URL }} style={s.webview}
        userAgent={`${Platform.OS} WafyDrive/0.1.0`}
        onLoadEnd={() => setLoading(false)} onError={() => { setLoading(false); setError(true) }}
        onNavigationStateChange={(nav: WebViewNavigation) => setCanGoBack(nav.canGoBack)}
        javaScriptEnabled domStorageEnabled startInLoadingState={false} allowsBackForwardNavigationGestures sharedCookiesEnabled />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 }, webview: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorTitle: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  retryBtn: { paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8 },
})
