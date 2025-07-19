import { NextResponse } from 'next/server';
import { getAllRfqs, createRfq } from '@/lib/database';

export async function GET() {
  try {
    const rfqs = await getAllRfqs();
    return NextResponse.json(rfqs);
  } catch (error) {
    console.error('Failed to fetch RFQs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch RFQs' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const rfqData = await request.json();
    const newRfq = await createRfq(rfqData);
    return NextResponse.json(newRfq, { status: 201 });
  } catch (error) {
    console.error('Failed to create RFQ:', error);
    return NextResponse.json(
      { error: 'Failed to create RFQ' },
      { status: 500 }
    );
  }
}