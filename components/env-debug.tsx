'use client'

import * as React from 'react'
import { NEXT_PUBLIC_BASE_URL } from '@/lib/base-url'

export default function EnvDebugClient() {
  const [origin, setOrigin] = React.useState<string>('')

  React.useEffect(() => {
    // Disponível apenas no cliente
    setOrigin(window.location.origin)
  }, [])

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        Valor de process.env.NEXT_PUBLIC_BASE_URL (embutido no build):
      </p>
      <code className="block rounded bg-gray-100 p-2 text-xs">
        {NEXT_PUBLIC_BASE_URL || '(vazio)'}
      </code>

      <p className="mt-4 text-sm text-gray-600">
        window.location.origin (tempo de execução no navegador):
      </p>
      <code className="block rounded bg-gray-100 p-2 text-xs">
        {origin || '(detectando...)'}
      </code>
    </div>
  )
}
