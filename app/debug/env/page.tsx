import EnvDebugClient from '@/components/env-debug'
import { getBaseUrl } from '@/lib/base-url'
import { headers } from 'next/headers'

export default function EnvPage() {
  // Exemplo de uso no servidor: deriva com base nos cabeçalhos se a env não estiver setada
  const baseUrlServer = getBaseUrl(headers())

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Debug de Variáveis de Ambiente</h1>

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-medium">Base URL (servidor)</h2>
        <p className="text-sm text-gray-600">
          Valor calculado no servidor via getBaseUrl(headers):
        </p>
        <code className="block rounded bg-gray-100 p-2 text-xs">{baseUrlServer}</code>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-medium">Base URL (cliente)</h2>
        <EnvDebugClient />
      </section>

      <section className="mt-10">
        <h3 className="mb-2 text-base font-medium">Como configurar</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>Defina NEXT_PUBLIC_BASE_URL nas variáveis do projeto (ex.: https://meu-dominio.com).</li>
          <li>Em desenvolvimento local, você pode usar http://localhost:3000.</li>
          <li>
            Variáveis NEXT_PUBLIC_* ficam acessíveis no cliente e são embutidas no bundle durante o
            build, exigindo rebuild ao alterar [^4][^5].
          </li>
        </ul>
      </section>
    </main>
  )
}
