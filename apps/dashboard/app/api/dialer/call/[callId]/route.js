import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { callId } = params;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:3000';

  try {
    const res = await fetch(`${backendUrl}/api/dialer/call/${callId}`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
        authorization: request.headers.get('authorization') || '',
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 503 });
  }
}
