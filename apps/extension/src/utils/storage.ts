import { ModelApiKeys, ModelProvider } from "@extrascan/shared/types"

import { Storage } from "@plasmohq/storage"

// @plasmohq/storage library will enable the storage permission automatically

// will default to chrome.storage.sync
const storage = new Storage()

export async function getStoredApiKeys(): Promise<ModelApiKeys> {
  try {
    const result = await storage.get("apiKeys")
    return (result || {}) as ModelApiKeys
  } catch (error) {
    console.error("Error getting API keys:", error)
    return {}
  }
}

export const setStoredApiKey = async (
  provider: ModelProvider,
  key: string
): Promise<void> => {
  try {
    const currentKeys = await getStoredApiKeys()
    await storage.set("apiKeys", {
      ...currentKeys,
      [provider]: key
    })
  } catch (error) {
    console.error("Error setting API key:", error)
  }
}
