// src/app/api/rfqs/[id]/reject/route.js
import { NextResponse } from 'next/server';
import { rejectRfq } from '@/lib/database';
import { getServerSession } from 'next-auth';
import { hasAccess } from '@/utils/access';

export async function POST(req, { params }) {
  const session = await getServerSession();
  if (!session?.user || !hasAccess(session.user.role, 'rfq:reject')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { reason } = await req.json();
  if (!reason) {
    return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
  }
  try {
    const rfq = await rejectRfq(params.id, session.user.id, reason);
    return NextResponse.json(rfq);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
