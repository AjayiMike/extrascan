import { createContext, useContext, useEffect, useState } from "react"

import {
  EIP6963AnnounceProviderEvent,
  EIP6963EventNames,
  EIP6963ProviderDetail,
  isPreviouslyConnectedProvider,
  isSupportedChain,
  SupportedChainId,
  switchChain
} from "~config/eip6963.ts"

const WalletContext = createContext<{
  account?: string | null
  chainId?: number | null
  connectedProvider?: EIP6963ProviderDetail | null
  injectedProviders: Map<string, EIP6963ProviderDetail>
  handleConnectProvider: (provider: EIP6963ProviderDetail) => void
  handleSwitchChain: () => void
  handleDisconnect: () => void
}>({
  account: null,
  chainId: null,
  connectedProvider: null,
  injectedProviders: new Map(),
  handleConnectProvider: () => {},
  handleSwitchChain: () => {},
  handleDisconnect: () => {}
})

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  /**
   * @title injectedProviders
   * @dev State variable to store injected providers we have recieved from the extension as a map.
   */
  const [injectedProviders, setInjectedProviders] = useState<
    Map<string, EIP6963ProviderDetail>
  >(new Map())

  /**
   * @title connection
   * @dev State variable to store connection information.
   */
  const [connection, setConnection] = useState<{
    providerUUID: string
    accounts: string[]
    chainId: number
  } | null>(null)

  useEffect(() => {
    /**
     * @title onAnnounceProvider
     * @dev Event listener for EIP-6963 announce provider event.
     * @param event The announce provider event.
     */
    const onAnnounceProvider = (event: EIP6963AnnounceProviderEvent) => {
      console.log("onAnnounceProvider: ", event)
      //   console.log("window ethereum: ", (window as any).ethereum)
      const { icon, rdns, uuid, name } = event.detail.info

      if (!icon || !rdns || !uuid || !name) {
        console.error("invalid eip6963 provider info received!")
        return
      }
      setInjectedProviders((prevProviders) => {
        const providers = new Map(prevProviders)
        providers.set(uuid, event.detail)
        return providers
      })

      // This ensures that on page reload, the provider that was previously connected is automatically connected again.
      // It help prevent the need to manually reconnect again when the page reloads
      if (isPreviouslyConnectedProvider(rdns)) {
        handleConnectProvider(event.detail)
      }
    }

    // Add event listener for EIP-6963 announce provider event
    window.addEventListener(
      EIP6963EventNames.Announce,
      onAnnounceProvider as EventListener
    )

    // Dispatch the request for EIP-6963 provider
    window.dispatchEvent(new Event(EIP6963EventNames.Request))

    // Clean up by removing the event listener and resetting injected providers
    return () => {
      window.removeEventListener(
        EIP6963EventNames.Announce,
        onAnnounceProvider as EventListener
      )
      setInjectedProviders(new Map())
    }
  }, [])

  /**
   * @title handleConnectProvider
   * @dev Function to handle connecting to a provider.
   * @param selectedProviderDetails The selected provider details.
   */
  async function handleConnectProvider(
    selectedProviderDetails: EIP6963ProviderDetail
  ) {
    const { provider, info } = selectedProviderDetails
    try {
      const accounts = (await provider.request({
        method: "eth_requestAccounts"
      })) as string[]
      const chainId = await provider.request({ method: "eth_chainId" })
      setConnection({
        providerUUID: info.uuid,
        accounts,
        chainId: Number(chainId)
      })
      // localStorage.setItem(
      //     LOCAL_STORAGE_KEYS.PREVIOUSLY_CONNECTED_PROVIDER_RDNS,
      //     info.rdns
      // );
    } catch (error) {
      console.error(error)
      throw new Error("Failed to connect to provider")
    }
  }

  /**
   * @title handleSwitchChain
   * @dev Function to handle switching the chain.
   */
  const handleSwitchChain = async () => {
    try {
      if (!connection) return
      const provider = injectedProviders.get(connection.providerUUID)!.provider
      const chain = isSupportedChain(connection.chainId)
        ? connection.chainId === SupportedChainId.SEPOLIA
          ? SupportedChainId.NAHMII3_TESTNET
          : SupportedChainId.SEPOLIA
        : SupportedChainId.SEPOLIA
      await switchChain(chain, provider)
      setConnection({
        ...connection,
        chainId: chain
      })
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * @title handleDisconnect
   * @dev Function to handle disconnecting from the provider.
   */
  const handleDisconnect = () => {
    setConnection(null)
    // localStorage.removeItem(
    //     LOCAL_STORAGE_KEYS.PREVIOUSLY_CONNECTED_PROVIDER_RDNS
    // );
  }

  const connectedInjectectProvider =
    connection && injectedProviders.get(connection.providerUUID)

  return (
    <WalletContext.Provider
      value={{
        account: connection?.accounts[0],
        chainId: connection?.chainId,
        connectedProvider: connectedInjectectProvider,
        injectedProviders,
        handleConnectProvider,
        handleSwitchChain,
        handleDisconnect
      }}>
      {children}
    </WalletContext.Provider>
  )
}
