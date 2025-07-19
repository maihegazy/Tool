import { NextResponse } from 'next/server';
import { updateRfq, deleteRfq } from '@/lib/database';

export async function PUT(request, { params }) {
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