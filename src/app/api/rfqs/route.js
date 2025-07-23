// src/app/api/rfqs/route.js
import { NextResponse } from 'next/server';
import { getAllRfqs, createRfq } from '@/lib/database';
import { getServerSession } from 'next-auth';
import { hasAccess } from '@/utils/access';

export async function GET(request) {
  const session = await getServerSession();
  if (!session?.user || !hasAccess(session.user.role, 'rfq:view')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const rfqs = await getAllRfqs();
    return NextResponse.json(rfqs);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch RFQs' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession();
  if (!session?.user || !hasAccess(session.user.role, 'rfq:create')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const data = await request.json();
    const newRfq = await createRfq(data, session.user.id);
    return NextResponse.json(newRfq, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create RFQ' }, { status: 500 });
  }
}
