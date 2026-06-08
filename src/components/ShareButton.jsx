/**
 * 📤 SHARE BUTTON — Botão de compartilhamento com opções
 */
import { useState } from 'react'
import { shareOptions } from '../utils/sharing'

export default function ShareButton({ data, className = '' }) {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const { title, description, url, hashtags } = data
  const shares = shareOptions({ title, description, url, hashtags })

  const handleShare = (platform) => {
    shares[platform]?.()
    setShowMenu(false)
  }

  const handleCopy = () => {
    shares.copy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl
                 text-white font-bold text-sm transition-all flex items-center gap-2"
      >
        🔗 Compartilhar
        {showMenu ? '▲' : '▼'}
      </button>

      {/* Menu */}
      {showMenu && (
        <div className="absolute top-full right-0 mt-2 bg-brand-card border border-brand-border rounded-xl shadow-2xl z-50 min-w-56 p-2">
          {/* Share Options */}
          <div className="space-y-1 pb-2 border-b border-white/10">
            <ShareOption
              icon="💬"
              label="WhatsApp"
              onClick={() => handleShare('whatsapp')}
            />
            <ShareOption
              icon="𝕏"
              label="Twitter/X"
              onClick={() => handleShare('twitter')}
            />
            <ShareOption
              icon="f"
              label="Facebook"
              onClick={() => handleShare('facebook')}
            />
            <ShareOption
              icon="✈️"
              label="Telegram"
              onClick={() => handleShare('telegram')}
            />
            <ShareOption
              icon="in"
              label="LinkedIn"
              onClick={() => handleShare('linkedIn')}
            />
            <ShareOption
              icon="🤖"
              label="Reddit"
              onClick={() => handleShare('reddit')}
            />
          </div>

          {/* Other Options */}
          <div className="space-y-1 pt-2">
            <button
              onClick={() => handleShare('email')}
              className="w-full px-3 py-2 text-sm text-left hover:bg-white/5 rounded transition flex items-center gap-2 text-white"
            >
              ✉️ Email
            </button>
            <button
              onClick={handleCopy}
              className="w-full px-3 py-2 text-sm text-left hover:bg-white/5 rounded transition flex items-center gap-2 text-white"
            >
              📋 {copied ? 'Copiado!' : 'Copiar Link'}
            </button>
          </div>

          {/* URL Preview */}
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-white/40 break-all">{url}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function ShareOption({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-3 py-2.5 text-left hover:bg-white/5 rounded transition flex items-center gap-2 text-white text-sm"
    >
      <span className="text-base">{icon}</span>
      {label}
    </button>
  )
}
