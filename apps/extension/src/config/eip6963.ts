// Types

/**
 * Represents the assets needed to display and identify a wallet.
 *
 * @type EIP6963ProviderInfo
 * @property uuid - A locally unique identifier for the wallet. MUST be a v4 UUID.
 * @property name - The name of the wallet.
 * @property icon - The icon for the wallet. MUST be data URI.
 * @property rdns - The reverse syntax domain name identifier for the wallet.
 */
export type EIP6963ProviderInfo = {
  uuid: string
  name: string
  icon: string
  rdns: string
}

/**
 * @type EIP1193Provider
 * @dev a minimal interface of EIP1193 Provider
 */
export type EIP1193Provider = {
  request: (payload: {
    method: string
    params?: unknown[] | object
  }) => Promise<unknown>
}

/**
 * Represents a provider and the information relevant for the dapp.
 *
 * @type EIP6963ProviderDetail
 * @property info - The EIP6963ProviderInfo object.
 * @property provider - The provider instance.
 */
export type EIP6963ProviderDetail = {
  info: EIP6963ProviderInfo
  provider: EIP1193Provider
}

export type EIP6963AnnounceProviderEvent = Event & {
  detail: EIP6963ProviderDetail
}

/**
 * @title EIP6963EventNames
 * @dev Enum defining EIP-6963 event names.
 */
export enum EIP6963EventNames {
  Announce = "eip6963:announceProvider",
  Request = "eip6963:requestProvider"
}

/**
 * @title SupportedChainId
 * @dev Enum defining supported chain IDs.
 */
export enum SupportedChainId {
  SEPOLIA = 11155111,
  NAHMII3_TESTNET = 4062
}

/**
 * @title LOCAL_STORAGE_KEYS
 * @dev Object containing local storage keys used in the dApp PREVIOUSLY_CONNECTED_PROVIDER_RDNS is the key under which the rdns of the previously connected provider is stored.
 * @
 */
export const LOCAL_STORAGE_KEYS = {
  PREVIOUSLY_CONNECTED_PROVIDER_RDNS: "PREVIOUSLY_CONNECTED_PROVIDER_RDNS"
}

/**
 * @title networkInfoMap
 * @dev Object containing network information for supported chains.
 */
export const networkInfoMap = {
  [SupportedChainId.SEPOLIA]: {
    chainId: `0x${SupportedChainId.SEPOLIA.toString(16)}`,
    chainName: "Sepolia test network",
    rpcUrls: ["https://sepolia.infura.io/v3/"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18
    }
  },
  [SupportedChainId.NAHMII3_TESTNET]: {
    chainId: `0x${SupportedChainId.NAHMII3_TESTNET.toString(16)}`,
    chainName: "Nahmii3 Test Network",
    rpcUrls: ["https://rpc.testnet.nahmii.io/"],
    blockExplorerUrls: ["https://explorer.testnet.nahmii.io/"],
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18
    }
  }
}

/**
 * @title isPreviouslyConnectedProvider
 * @dev Function to check if a provider was previously connected by comparing its rdns to the rdns previously store in the local storage the last time a connection was made.
 * @param providerRDNS The provider RDNS string.
 * @returns True if the providerRDNS matches the rdns found in the local storage.
 */
export function isPreviouslyConnectedProvider(providerRDNS: string): boolean {
  return (
    localStorage.getItem(
      LOCAL_STORAGE_KEYS.PREVIOUSLY_CONNECTED_PROVIDER_RDNS
    ) === providerRDNS
  )
}

/**
 * @title isSupportedChain
 * @dev Function to check if a chain is supported.
 * @param chainId The chain ID to check.
 * @returns True if the chain ID is supported, false otherwise.
 */
export function isSupportedChain(
  chainId: number | null | undefined
): chainId is SupportedChainId {
  if (!chainId) return false
  return !!SupportedChainId[chainId]
}

/**
 * @title switchChain
 * @dev Function to switch to a supported chain.
 * @param chain The chain ID to switch to.
 * @param provider The EIP1193Provider instance.
 */
export const switchChain = async (chain: number, provider: EIP1193Provider) => {
  if (!isSupportedChain(chain))
    return console.error("attempt to switch to a wrong chain!")
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chain.toString(16)}` }]
    })
  } catch (error: any) {
    if (error.code === 4902 || error.code === -32603) {
      const chainInfo = networkInfoMap[chain]
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [chainInfo]
        })
      } catch (addError) {
        console.error("user rejected network addition!")
      }
    }
  }
}
