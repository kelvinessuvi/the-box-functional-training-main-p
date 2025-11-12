import { NextResponse } from "next/server"

export async function GET() {
  // API temporariamente desabilitada para evitar problemas de hidratação
  return new Response("data: {\"error\": \"API temporariamente desabilitada\"}\n\n", {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  })
}
