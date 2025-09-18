import { Icon } from "@iconify/react"

export default function Default({
  hasApiKeys,
  goToSetting
}: {
  hasApiKeys: boolean
  goToSetting: () => void
}) {
  return (
    <div className="w-full">
      <div className="p-4 space-y-2 flex-1">
        <a
          href="https://www.extrascan.xyz"
          target="_blank"
          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md text-gray-700">
          <Icon icon="carbon:launch" className="w-5 h-5" />
          <span>Go to Extrascan</span>
        </a>

        <button
          onClick={goToSetting}
          className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md text-left text-gray-700">
          <Icon icon="carbon:api" className="w-5 h-5" />
          <span>
            API Keys{" "}
            {!hasApiKeys && (
              <span className="text-red-500 text-xs">(Required)</span>
            )}
          </span>
        </button>

        <a
          href="https://github.com/AjayiMike/extrascan"
          target="_blank"
          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md text-gray-700">
          <Icon icon="mdi:github" className="w-5 h-5" />
          <span>GitHub</span>
        </a>
      </div>
    </div>
  )
}
