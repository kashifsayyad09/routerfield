import { NextResponse } from 'next/server';
import { openrouterJson } from '@/lib/openrouterServer';
import { errorResponse, badRequest } from '@/lib/apiRouteHelpers';

export const dynamic = 'force-dynamic';

/**
 * POST /api/openrouter/images
 * Body: { model, prompt, aspect_ratio?, resolution?, quality?, n?, seed?,
 *         output_format?, input_references? }
 *
 * Proxies to OpenRouter's dedicated Image API (POST /api/v1/images) and
 * returns the same shape it does ({ data: [{ b64_json, media_type }], usage }),
 * so the browser can turn each entry into a `data:` URL.
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest('Request body must be JSON.');
  }

  const { model, prompt } = body || {};
  if (!model) return badRequest('Missing required field "model".');
  if (!prompt) return badRequest('Missing required field "prompt".');

  // Only forward fields the Image API actually understands, so a stray
  // client-side field never turns into a confusing 400 from upstream.
  const payload = { model, prompt };
  const passthroughFields = [
    'n', 'resolution', 'aspect_ratio', 'size', 'quality',
    'output_format', 'background', 'output_compression',
    'seed', 'input_references', 'provider',
  ];
  for (const field of passthroughFields) {
    if (body[field] !== undefined) payload[field] = body[field];
  }

  try {
    const result = await openrouterJson('/images', { method: 'POST', body: payload });
    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
