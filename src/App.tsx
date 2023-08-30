import './App.css'
import { useState, useEffect } from 'react'
import { formatBalance, formatChainId } from './utils';

import detectEthereumProvider from '@metamask/detect-provider'


const App = () => {
  const [hasProvider, setHasProvider] = useState<boolean | null>(null)
  const initialState = { accounts: [], balance: "", chainId: "" }
  const [wallet, setWallet] = useState(initialState)

  const [isConnecting, setIsConnecting] = useState(false); // to track if the user is connecting
  const [error, setError] = useState(false); // to track if an error occurred
  const [errorMessage, setErrorMessage] = useState(''); // to store the error message
  
  const updateWallet = async (accounts: any) => {
    const balance = formatBalance(await window.ethereum!.request({
      method: "eth_getBalance",
      params: [accounts[0], "latest"],
    }))
    const chainId = await window.ethereum!.request({
      method: "eth_chainId",
    })
    setWallet({ accounts, balance, chainId })
  }
  const handleConnect = async () => {
    setIsConnecting(true);
    await window.ethereum.request({
      method: "eth_requestAccounts",
    })
    .then((accounts:[]) => {
      setError(true)
     updateWallet(accounts)
    })
    .catch((err:any) => { 
      setError(true)
      setErrorMessage(err.message)
    })
    setIsConnecting(false)
  }


  useEffect(() => {
    const refreshAccounts = (accounts: any) => {
      if (accounts.length > 0) {
        updateWallet(accounts);
      } else {
        setWallet(initialState);
      }
    }

    const refreshChain = (chainId: any) => {
      setWallet((wallet) => ({ ...wallet, chainId }))
    }


    const getProvider = async () => {
      try {
        const provider = await detectEthereumProvider({ silent: true });
        console.log(provider);
        setHasProvider(Boolean(provider));

        if (provider) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          refreshAccounts(accounts);
          window.ethereum.on('accountsChanged', refreshAccounts);
          window.ethereum.on('chainChanged', refreshChain);
        }
      } catch (error) {
        console.error(error);
      }
    };


    getProvider()   // call the getProvider function

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', refreshAccounts);
        window.ethereum.removeListener('chainChanged', refreshChain);
      }
    };
  }, []);   // the effect only runs once when the component mounts
  const disableConnect = Boolean(wallet) && isConnecting

  return (
    <div className="App">
      <div>Injected Provider {hasProvider ? 'DOES' : 'DOES NOT'} Exist</div>

      {window.ethereum?.isMetaMask && wallet.accounts.length < 1 &&
                /* Updated */
        <button disabled={disableConnect} onClick={handleConnect}>Connect MetaMask</button>
      }

      {wallet.accounts.length > 0 &&
        <>
          <div>Wallet Accounts: {wallet.accounts[0]}</div>
          <div>Wallet Balance: {wallet.balance}</div>
          <div>Hex ChainId: {wallet.chainId}</div>
          <div>Numeric ChainId: {formatChainId(wallet.chainId)}</div>
        </>
      }
      { error && (                                        /* New code block */
          <div onClick={() => setError(false)}>
            <strong>Error:</strong> {errorMessage}
          </div>
        )
      }
    </div>
  )
}

export default App
