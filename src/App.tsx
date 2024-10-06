import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/landing';
import WhitepaperSICK from './pages/whitepaper';
import Home from './pages/home';
import Dashboard from './pages/dashboard';
import CrateCreator from './pages/createcrate';
import CrateDetailPage from './pages/crates';
import ExploreCrate from './pages/explorecrate/ExploreCrate';
import SickAi from './pages/sickai';
import { AuthProvider } from './context/AuthContext';
import { BuildType, OktoProvider } from 'okto-sdk-react';
import LoginPage from './components/LoginPage';
import SwapFunction from './pages/swap';
 
const OKTO_CLIENT_API_KEY = import.meta.env.VITE_OKTO_CLIENT_API_KEY;

const App: React.FC = () => {
  return (
    <Router>
            <AuthProvider>  

        <OktoProvider apiKey={OKTO_CLIENT_API_KEY} buildType={BuildType.SANDBOX}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explorecrate" element={<ExploreCrate />} />
        <Route path="/whitepaper" element={<WhitepaperSICK />} />
        <Route path="/cratecreator" element={<CrateCreator />} />
        <Route path="/crates/:id" element={<CrateDetailPage />} />
        <Route path="/sai" element={<SickAi />} />
        <Route path="/swap" element={<SwapFunction />} />
        </Routes>
      </OktoProvider>
      </AuthProvider> 
    </Router>
  );
}

export default App;