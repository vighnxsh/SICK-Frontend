  import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WalletProvider } from '@solana/wallet-adapter-react'
import {
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { TipLinkWalletAdapter } from "@tiplink/wallet-adapter"
import { WalletModalProvider, TipLinkWalletAutoConnectV2 } from '@tiplink/wallet-adapter-react-ui'
import App from './App.tsx'
import './index.css'
import '@solana/wallet-adapter-react-ui/styles.css'

import { OktoProvider, BuildType } from 'okto-sdk-react';


const OKTO_CLIENT_API = import.meta.env.VITE_OKTO_CLIENT_API;
const wallets = [
  new SolflareWalletAdapter(),
  new TipLinkWalletAdapter({
    title: "SICK",
    clientId: "cb46c2b5-91cb-4078-9543-7fcace89b15a",
    theme: "dark"
  }),
]

const GOOGLE_CLIENT_ID = "501015698849-8a0bh2sdvq8fr1uksock9arqlbo37rp2.apps.googleusercontent.com"



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId = {GOOGLE_CLIENT_ID}>
    <OktoProvider apiKey={OKTO_CLIENT_API} buildType={BuildType.SANDBOX}>
    <WalletProvider wallets={wallets} >
      <TipLinkWalletAutoConnectV2 isReady query={new URLSearchParams(window.location.search)}>
      
        <WalletModalProvider>
         
          <App/>
      
        </WalletModalProvider>
      </TipLinkWalletAutoConnectV2>
    </WalletProvider>
    </OktoProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
