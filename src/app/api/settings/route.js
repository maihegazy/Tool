import { NextResponse } from 'next/server';

const defaultSettings = {
  engineerRates: {
    'Junior': { HCC: 45, BCC: 35, MCC: 25 },
    'Standard': { HCC: 60, BCC: 50, MCC: 35 },
    'Senior': { HCC: 80, BCC: 65, MCC: 50 },
    'Principal': { HCC: 100, BCC: 80, MCC: 65 },
    'Technical Leader': { HCC: 120, BCC: 95, MCC: 75 },
    'FO': { HCC: 140, BCC: 110, MCC: 85 }
  },
  tmSellRates: {
    HCC: 120,
    BCC: 95,
    MCC: 75
  },
  wpConfig: {
    storyPointsToHours: 8,
    hardwareCostPerHour: 5,
    riskFactor: 15,
    tickets: {
      small: { storyPoints: 5, price: 2500, quotePercentage: 25 },
      medium: { storyPoints: 13, price: 6500, quotePercentage: 25 },
      large: { storyPoints: 21, price: 12000, quotePercentage: 50 }
    }
  }
};

export async function GET() {
  try {
    return NextResponse.json(defaultSettings);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const settingsData = await request.json();
    // For now, just return the updated settings
    // In production, this would save to database
    return NextResponse.json({ ...defaultSettings, ...settingsData });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}