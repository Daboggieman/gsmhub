'use client'

import { useEffect, useState } from 'react'
import {
  AFFILIATE_PLATFORMS,
  getAffiliatePlatform,
} from '@/lib/affiliate'

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
    // Deferred via a local step so the effect body itself performs no
    // synchronous state updates; loadStoredIds reads localStorage, which
    // must not run during render (SSR-unsafe).
    const loadAffiliateId = () => {
      setAffiliateId(loadStoredIds()[platformId] || '')
    }
    loadAffiliateId()
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
    <div className="space-y-space-md rounded-xl border border-dashed border-secondary-container/40 bg-secondary-container/10 p-space-lg">
      <p className="flex items-center gap-2 font-label-xs text-label-xs font-bold uppercase tracking-widest text-secondary">
        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">auto_fix_high</span>
        Affiliate Link Generator
      </p>
      <div className="grid grid-cols-2 gap-space-md">
        <div>
          <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase text-on-surface-variant">
            Platform
          </label>
          <select
            value={platformId}
            onChange={(e) => setPlatformId(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container p-2 font-label-md font-bold text-on-surface"
          >
            {AFFILIATE_PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase text-on-surface-variant">
            Search Query
          </label>
          <input
            type="text"
            placeholder="Galaxy S24 Ultra"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container p-2 font-label-md font-bold text-on-surface placeholder-outline"
          />
        </div>
      </div>
      {platform && platform.idPlaceholder !== 'No affiliate ID needed' && (
        <div>
          <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase text-on-surface-variant">
            Affiliate ID
          </label>
          <input
            type="text"
            placeholder={platform.idPlaceholder}
            value={affiliateId}
            onChange={(e) => setAffiliateId(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container p-2 font-label-md font-bold text-on-surface placeholder-outline"
          />
        </div>
      )}
      <div>
        <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase text-on-surface-variant">
          Generated URL
        </label>
        <div className="flex gap-space-sm">
          <input
            type="text"
            readOnly
            value={generatedUrl}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2 font-body-sm text-on-surface-variant"
          />
          <button
            type="button"
            onClick={handleCopy}
            title="Copy URL"
            className="shrink-0 rounded-lg border border-outline-variant bg-surface-container px-3 text-on-surface-variant transition-colors hover:text-secondary"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{copied ? 'check' : 'content_copy'}</span>
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={handleApply}
        disabled={!generatedUrl}
        className="w-full rounded-lg bg-primary-container py-2 font-label-xs text-label-xs font-bold uppercase tracking-widest text-on-primary-container transition-colors hover:bg-inverse-primary disabled:opacity-50"
      >
        Use This Link
      </button>
    </div>
  )
}
