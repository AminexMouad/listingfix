import { useState } from 'react'
import { copyText } from '../lib/csv'

export default function CopyButton({
  text,
  label = 'Copy',
  className = 'btn btn-sm',
  disabled,
}: {
  text: string
  label?: string
  className?: string
  disabled?: boolean
}) {
  const [state, setState] = useState<'idle' | 'ok' | 'fail'>('idle')

  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      onClick={async () => {
        const ok = await copyText(text)
        setState(ok ? 'ok' : 'fail')
        setTimeout(() => setState('idle'), 1800)
      }}
    >
      {state === 'ok' ? 'Copied' : state === 'fail' ? 'Copy failed' : label}
    </button>
  )
}
