import { NextResponse } from 'next/server';
import { getServerApiKey } from '@/lib/openrouterServer';

// Lets the client know (without ever seeing the key) whether the server
// is configured to talk to OpenRouter yet.
export async function GET() {
  return NextResponse.json({ configured: Boolean(getServerApiKey()) });
}
