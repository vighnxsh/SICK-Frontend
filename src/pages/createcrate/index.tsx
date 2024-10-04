import React, { useState, useEffect, ChangeEvent, useMemo } from 'react';
import tokenData from './tokens.json';
import debounce from 'lodash/debounce';
import BackendApi from '../../constants/api.ts';
import fetchUserData from '../../constants/fetchUserData.ts';
import Sidebar from '../../components/ui/sidebar.tsx';
import SideBarPhone from '../../components/ui/sidebarPhone.tsx';
import { useAuth } from '../../context/AuthContext';

interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  tags: string[];
  daily_volume: number;
  created_at: string;
  freeze_authority: string | null;
  mint_authority: string | null;
  permanent_delegate: string | null;
  minted_at: string | null;
  extensions: {
    coingeckoId: string;
  };
}

interface SelectedToken extends Token {
  allocation: number;
}

interface CrateData {
  name: string;
  tokens: {
    symbol: string;
    name: string;
    quantity: number;
  }[];
  totalCost: number;
  creatorId: string;
  picture: string;
}

const CrateCreator: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<SelectedToken[]>([]);
  const [crateName, setCrateName] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [totalAllocation, setTotalAllocation] = useState<number>(0);
  const [error, setError] = useState<string>('');
 

  useEffect(() => {
    setTokens(tokenData);
    // checkLoginStatus();
  }, []);

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedToken = tokens.find(token => token.address === e.target.value);
    if (selectedToken) {
      handleTokenSelect(selectedToken);
    }
  };

  // const checkLoginStatus = async () => {
  //   const creatorId = localStorage.getItem('creatorId');
  
  //   if (creatorId) {
  //     setIsLoggedIn(true);
  //   } else {
  //     // Call the reusable function
  //     const user = await fetchUserData();
      
  //     // Set creatorId in localStorage if the user is found
  //     if (user) {
  //       localStorage.setItem('creatorId', user.id);
  //       setIsLoggedIn(true); // You can handle setting login here
  //     }
  //   }
  // };
  


  const handleTokenSelect = (selectedToken: Token) => {
   
    setSelectedTokens([...selectedTokens, { ...selectedToken, allocation: 0 }]);
    setSearchTerm('');
  };

  const handleAllocationChange = (index: number, value: string) => {
    const newSelectedTokens = [...selectedTokens];
    newSelectedTokens[index].allocation = Number(value);
    setSelectedTokens(newSelectedTokens);
    
    const newTotalAllocation = newSelectedTokens.reduce((sum, token) => sum + token.allocation, 0);
    setTotalAllocation(newTotalAllocation);
    
    if (newTotalAllocation > 100) {
      setError('Total allocation cannot exceed 100%');
    } else {
      setError('');
    }
  };

  const handleCreateCrate = async () => {
    if (totalAllocation !== 100) {
      setError('Total allocation must be 100%');
      return;
    }

    const creatorId = localStorage.getItem('creatorId');
    if (!creatorId) {
      setError('Creator not found. Please log in again.');
      return;
    }

    const crateData: CrateData = {
      name: crateName,
      tokens: selectedTokens.map(token => ({
        symbol: token.symbol,
        name: token.name,
        quantity: token.allocation
      })),
      totalCost: 0,
      creatorId,
      picture: selectedTokens[0].logoURI
    };
    setIsCreating(true);  // Disable the button

    try {
      const response = await fetch(`${BackendApi}/crates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crateData)
      });

      if (!response.ok) throw new Error('Failed to create crate');

      const result = await response.json();
      console.log('Crate created:', result);
window.location.href = '/crates/' + result.id;
    } catch (error) {
      if (error instanceof Error) {
        setError('Failed to create crate: ' + error.message);
      } else {
        setError('An unknown error occurred');
      } } finally {
        setIsCreating(false);  // Re-enable the button
      }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        setSearchTerm(term);
      }, 300),
    []
  );

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const filteredTokens = useMemo(() => {
    if (!searchTerm) return [];
    return tokens.filter(
      token =>
        token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 20); // Limit to 5 suggestions
  }, [tokens, searchTerm]);


  const { handleLogout } = useAuth();

  return (
    
    <div className="max-w-6xl mx-auto p-8 bg-gradient-to-b from-gray-900 via-lime-950 to-gray-900 text-white rounded-3xl shadow-2xl">
      
      <h1 className="text-6xl font-semibold mb-12 text-transparent bg-clip-text bg-gradient-to-r from-lime-500 via-green-300 to-emerald-600 animate-gradient-y font-mono ">Forge Your Crate</h1>
      
      <input
        type="text"
        value={crateName}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setCrateName(e.target.value)}
        placeholder="Name your crate"
        className="w-full p-4 mb-8 bg-gray-800/50 backdrop-blur-sm border-2 border-lime-500/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-600/50 text-white placeholder-gray-400 transition-all duration-300 ease-in-out hover:border-lime-400/50 text-2xl"
      />

      <div className="relative mb-8">
        <input
          type="text"
          onChange={handleSearchChange}
          placeholder="Search tokens"
          className="w-full p-4 bg-gray-800/50 backdrop-blur-sm border-2 border-lime-500/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-600/50 text-white placeholder-gray-400 transition-all duration-300 ease-in-out hover:border-lime-400/50"
        />
        {filteredTokens.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-gray-800/90 backdrop-blur-md border-2 border-lime-500/30 rounded-2xl mt-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-lime-500/50 scrollbar-track-gray-800/50 z-10">
            {filteredTokens.map((token) => (
              <div
                key={token.address}
                onClick={() => handleTokenSelect(token)}
                className="flex items-center p-4 hover:bg-gray-700/50 cursor-pointer border-b border-lime-500/30 last:border-b-0 transition-colors duration-200"
              >
                <img src={token.logoURI} alt={token.name} className="w-8 h-8 mr-4 rounded-full" />
                <span className="font-medium">{token.name} <span className="text-lime-400">({token.symbol})</span></span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-8">
        <select 
          onChange={handleSelectChange}
          className="w-full p-4 bg-gray-800/50 backdrop-blur-sm border-2 border-lime-500/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-600/50 text-white appearance-none cursor-pointer transition-all duration-300 ease-in-out hover:border-lime-400/50"
        >
          <option value="">Select a token</option>
          {tokens.map((token) => (
            <option key={token.address} value={token.address}>
              {token.name} ({token.symbol})
            </option>
          ))}
        </select>
      </div>

      {selectedTokens.map((token, index) => (
        <div key={token.address} className="flex items-center mb-6 bg-gray-800/50 backdrop-blur-sm p-4 rounded-2xl border-2 border-lime-500/30 hover:border-lime-400/50 transition-all duration-300">
          <img src={token.logoURI} alt={token.name} className="w-10 h-10 mr-4 rounded-full" />
          <span className="flex-grow font-medium">{token.name} <span className="text-lime-400">({token.symbol})</span></span>
          <input
            type="number"
            value={token.allocation}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleAllocationChange(index, e.target.value)}
            className="w-24 p-2 bg-gray-700/50 backdrop-blur-sm border-2 border-lime-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-600/50 text-white text-center"
            min="0"
            max="100"
          />
          <span className="ml-2 text-lime-400">%</span>
        </div>
      ))}
      
      <div className="mt-8 mb-4 bg-gray-800/50 backdrop-blur-sm h-8 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-lime-500 via-green-400 to-emerald-600 transition-all duration-500 ease-in-out"
          style={{ width: `${totalAllocation}%` }}
        ></div>
      </div>
      <div className="text-right text-xl font-semibold text-lime-400 mb-8">{totalAllocation}% allocated</div>

      {error && (
        <div className="bg-red-900/30 backdrop-blur-sm text-red-200 p-4 mb-8 rounded-2xl border-2 border-red-500/30 animate-pulse">
          {error}
        </div>
      )}

      <div className="flex justify-center mb-20">
        <button 
          onClick={handleCreateCrate}
          disabled={totalAllocation !== 100 || selectedTokens.length === 0 || isCreating}
          className={`px-8 py-4 rounded-2xl transition-all duration-300 ${
            totalAllocation === 100 && selectedTokens.length > 0 && !isCreating
              ? 'bg-gradient-to-r from-lime-400 via-lime-500 to-green-500 hover:from-lime-500 hover:via-green-400 hover:to-emerald-600 text-black font-bold cursor-pointer transform hover:scale-105 shadow-lg hover:shadow-xl text-2xl '
              : 'bg-gray-600/50 backdrop-blur-sm text-gray-400 cursor-not-allowed'
          }`}
        >
          {isCreating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Creating...
            </span>
          ) : 'Create '}
        </button>
        <button 
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
      >
        Logout
      </button>
      </div>
      <Sidebar/>
      <SideBarPhone/>
    </div>
  );
};

export default CrateCreator;