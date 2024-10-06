import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WalletProvider } from '@solana/wallet-adapter-react'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { TipLinkWalletAdapter } from "@tiplink/wallet-adapter"
import { WalletModalProvider, TipLinkWalletAutoConnectV2 } from '@tiplink/wallet-adapter-react-ui'
import { OktoProvider, BuildType } from 'okto-sdk-react'
import { AuthProvider } from './context/AuthContext'
import App from './App'

// Styles
import './index.css'
import '@solana/wallet-adapter-react-ui/styles.css'

// Environment variables
const OKTO_CLIENT_API = import.meta.env.REACT_APP_OKTO_API_KEY
const GOOGLE_CLIENT_ID = import.meta.env.REACT_APP_GOOGLE_CLIENT_ID

// Wallet configuration
const wallets = [
  new SolflareWalletAdapter(),
  new TipLinkWalletAdapter({
    title: "SICK",
    clientId: "cb46c2b5-91cb-4078-9543-7fcace89b15a",
    theme: "dark"
  })
]

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, (error) => {
      console.log('ServiceWorker registration failed: ', error);
    });
  });
}

createRoot(document.getElementById('root')!).render(

    <WalletProvider wallets={wallets} autoConnect>
      <TipLinkWalletAutoConnectV2 isReady query={new URLSearchParams(window.location.search)}>
        <WalletModalProvider>
          <App/>
        </WalletModalProvider>
      </TipLinkWalletAutoConnectV2>
    </WalletProvider>

)