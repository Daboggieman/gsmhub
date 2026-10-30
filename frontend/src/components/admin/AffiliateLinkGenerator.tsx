'use client'

import { useEffect, useState } from 'react'
import {
  AFFILIATE_PLATFORMS,
  getAffiliatePlatform,
} from '@/lib/affiliate'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWandMagicSparkles, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons'

const AFFILIATE_IDS_STORAGE_KEY = 'gsmhub-affiliate-ids'

function loadStoredIds(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(AFFILIATE_IDS_STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

interface AffiliateLinkGeneratorProps {
  /** Pre-filled search query, usually the device name. */
  defaultQuery?: string
  /** Receives the generated URL (and platform label) when the admin applies it. */
  onApply: (url: string, platformLabel: string) => void
}

/**
 * Builds a tracked retailer URL from a search query. The affiliate ID is
 * remembered per platform in localStorage so it only needs to be entered
 * once per browser.
 */
export default function AffiliateLinkGenerator({
  defaultQuery = '',
  onApply,
}: AffiliateLinkGeneratorProps) {
  const [platformId, setPlatformId] = useState(AFFILIATE_PLATFORMS[0].id)
  const [query, setQuery] = useState(defaultQuery)
  const [affiliateId, setAffiliateId] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setAffiliateId(loadStoredIds()[platformId] || '')
  }, [platformId])

  const platform = getAffiliatePlatform(platformId)
  const generatedUrl = platform ? platform.buildUrl(query, affiliateId) : ''

  const handleApply = () => {
    if (!platform || !generatedUrl) return
    // Remember the ID for next time.
    try {
      const ids = loadStoredIds()
      ids[platformId] = affiliateId
      localStorage.setItem(AFFILIATE_IDS_STORAGE_KEY, JSON.stringify(ids))
    } catch {
      // localStorage unavailable — the generator still works, just without memory.
    }
    onApply(generatedUrl, platform.label)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard unavailable (insecure context) — the admin can select manually.
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-4">
      <p className="flex items-center gap-2 text-[10px] font-black tracking-widest text-indigo-600 uppercase">
        <FontAwesomeIcon icon={faWandMagicSparkles} />
        Affiliate Link Generator
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[10px] font-black text-gray-500 uppercase">
            Platform
          </label>
          <select
            value={platformId}
            onChange={(e) => setPlatformId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm font-bold text-gray-900"
          >
            {AFFILIATE_PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-black text-gray-500 uppercase">
            Search Query
          </label>
          <input
            type="text"
            placeholder="Galaxy S24 Ultra"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm font-bold text-gray-900"
          />
        </div>
      </div>
      {platform && platform.idPlaceholder !== 'No affiliate ID needed' && (
        <div>
          <label className="mb-1 block text-[10px] font-black text-gray-500 uppercase">
            Affiliate ID
          </label>
          <input
            type="text"
            placeholder={platform.idPlaceholder}
            value={affiliateId}
            onChange={(e) => setAffiliateId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm font-bold text-gray-900"
          />
        </div>
      )}
      <div>
        <label className="mb-1 block text-[10px] font-black text-gray-500 uppercase">
          Generated URL
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={generatedUrl}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2 font-mono text-xs text-gray-600"
          />
          <button
            type="button"
            onClick={handleCopy}
            title="Copy URL"
            className="shrink-0 rounded-lg border border-gray-300 bg-white px-3 text-gray-500 transition-colors hover:text-indigo-600"
          >
            <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={handleApply}
        disabled={!generatedUrl}
        className="w-full rounded-lg bg-indigo-600 py-2 text-[10px] font-black tracking-widest text-white uppercase transition-colors hover:bg-indigo-700 disabled:opacity-50"
      >
        Use This Link
      </button>
    </div>
  )
}
