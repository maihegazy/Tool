// src/app/api/rfqs/[id]/submit/route.js
import { NextResponse } from 'next/server';
import { submitRfq } from '@/lib/database';
import { getServerSession } from 'next-auth';
import { hasAccess } from '@/utils/access';

export async function POST(req, { params }) {
  const session = await getServerSession();
  if (!session?.user || !hasAccess(session.user.role, 'rfq:submit')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const rfq = await submitRfq(params.id, session.user.id);
    return NextResponse.json(rfq);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
