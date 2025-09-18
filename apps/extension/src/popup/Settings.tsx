import {
  MODEL_DISPLAY_NAMES,
  ModelProvider,
  SUPPORTED_PROVIDERS
} from "@extrascan/shared/types"
import { validateApiKey } from "@extrascan/shared/utils"
import { Icon } from "@iconify/react"
import clsx from "clsx"
import { useEffect, useState } from "react"

import { getStoredApiKeys, setStoredApiKey } from "../utils/storage.ts"

const COMING_SOON_PROVIDERS = [ModelProvider.OPENAI, ModelProvider.ANTHROPIC]

export default function Settings() {
  const [apiKeys, setApiKeys] = useState<{ [key in ModelProvider]?: string }>(
    {}
  )
  const [errors, setErrors] = useState<Record<ModelProvider, string>>(
    {} as Record<ModelProvider, string>
  )

  useEffect(() => {
    const loadApiKeys = async () => {
      const keys = await getStoredApiKeys()
      setApiKeys(keys)
    }
    loadApiKeys()
  }, [])

  const handleSave = async (provider: ModelProvider, value: string) => {
    try {
      setErrors((prev) => ({ ...prev, [provider]: "" }))
      if (!validateApiKey(provider, value)) {
        setErrors((prev) => ({
          ...prev,
          [provider]: `Invalid ${provider} API key format`
        }))
        return
      }
      await setStoredApiKey(provider, value)
      setApiKeys((prev) => ({ ...prev, [provider]: value }))
    } catch (error) {
      console.error("Error saving API key:", error)
    }
  }

  const handlePasteClick = async (provider: ModelProvider) => {
    try {
      const text = await navigator.clipboard.readText()
      handleSave(provider, text)
    } catch (error) {
      console.error("Failed to read clipboard:", error)
    }
  }

  const handleClear = async (provider: ModelProvider) => {
    try {
      await setStoredApiKey(provider, "")
      setApiKeys((prev) => ({ ...prev, [provider]: "" }))
    } catch (error) {
      console.error("Error clearing API key:", error)
    }
  }

  const renderProviderInput = (provider: ModelProvider, disabled = false) => (
    <div key={provider} className="space-y-2">
      <label className="block text-xs font-medium text-gray-700">
        {MODEL_DISPLAY_NAMES[provider]}
      </label>
      <div className="flex gap-2">
        <div className="flex-1 flex">
          <input
            type="password"
            value={apiKeys[provider] || ""}
            readOnly
            disabled={disabled}
            className={clsx(
              "w-full rounded-l-md bg-gray-50 border border-r-0 border-gray-300 shadow-sm px-3 py-2 text-sm outline-none",
              { "bg-gray-100 cursor-not-allowed": disabled }
            )}
            placeholder={disabled ? "Coming soon" : "Click paste button →"}
          />
          {apiKeys[provider] ? (
            <button
              onClick={() => handleClear(provider)}
              disabled={disabled}
              className={clsx(
                "px-3 py-2 rounded-r-md border border-l-0 border-gray-300",
                disabled
                  ? "bg-gray-100 cursor-not-allowed"
                  : "bg-gray-50 hover:bg-gray-100 hover:text-red-600"
              )}>
              <Icon icon="lucide:x" className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handlePasteClick(provider)}
              disabled={disabled}
              className={clsx(
                "px-3 py-2 rounded-r-md border border-l-0 border-gray-300",
                disabled
                  ? "bg-gray-100 cursor-not-allowed"
                  : "bg-gray-50 hover:bg-gray-100"
              )}>
              <Icon icon="hugeicons:file-paste" className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      {errors[provider] && (
        <p className="mt-[2px] text-xs text-red-600">{errors[provider]}</p>
      )}
    </div>
  )

  return (
    <div className="w-full flex flex-col">
      <div className="p-4 space-y-4 flex-1 overflow-auto">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-900">
            Available Models
          </h2>
          {SUPPORTED_PROVIDERS.map((provider) => renderProviderInput(provider))}
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-900">Coming Soon</h2>
          {COMING_SOON_PROVIDERS.map((provider) =>
            renderProviderInput(provider, true)
          )}
        </div>
      </div>
    </div>
  )
}
