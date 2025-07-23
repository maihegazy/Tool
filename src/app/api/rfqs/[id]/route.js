// src/app/api/rfqs/[id]/route.js
import { NextResponse } from 'next/server';
import { getRfqById, updateRfq, deleteRfq } from '@/lib/database';
import { getServerSession } from 'next-auth';
import { hasAccess } from '@/utils/access';

export async function GET(request, { params }) {
  const session = await getServerSession();
  if (!session?.user || !hasAccess(session.user.role, 'rfq:view')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const rfq = await getRfqById(params.id);
  if (!rfq) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(rfq);
}

export async function PUT(request, { params }) {
  const session = await getServerSession();
  if (!session?.user || !hasAccess(session.user.role, 'rfq:edit')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const updates = await request.json();
    const updated = await updateRfq(params.id, updates, session.user.role);
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession();
  if (!session?.user || !hasAccess(session.user.role, 'rfq:delete')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const result = await deleteRfq(params.id, session.user.role);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
