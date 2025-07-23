import { NextResponse } from 'next/server';
import { updateRfq, deleteRfq } from '@/lib/database';
import { hasAccess } from '@/utils/access';

export async function PUT(request, { params }) {
  const role = request.headers.get('x-user-role') || '';
  if (!hasAccess(role, 'rfq:edit')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const updates = await request.json();
    const updatedRfq = await updateRfq(params.id, updates);
    return NextResponse.json(updatedRfq);
  } catch (error) {
    console.error('Failed to update RFQ:', error);
    return NextResponse.json(
      { error: 'Failed to update RFQ' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const role = request.headers.get('x-user-role') || '';
  if (!hasAccess(role, 'rfq:delete')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    await deleteRfq(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete RFQ:', error);
    return NextResponse.json(
      { error: 'Failed to delete RFQ' },
      { status: 500 }
    );
  }
}