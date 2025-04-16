import { NextResponse } from 'next/server';
import { addMealEntry, getMealEntries } from '@/lib/sheets';
import type { MealEntry } from '@/lib/types';

export async function GET() {
  try {
    const entries = await getMealEntries();
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json(
      { error: 'Error fetching entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const entry: MealEntry = await request.json();
    
    // Validate input
    if (!entry.date || typeof entry.lunch !== 'number' || typeof entry.dinner !== 'number') {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    if (entry.lunch < 0 || entry.lunch > 2 || entry.dinner < 0 || entry.dinner > 2) {
      return NextResponse.json(
        { error: 'Lunch and dinner counts must be between 0 and 2' },
        { status: 400 }
      );
    }

    const success = await addMealEntry(entry);
    
    if (success) {
      return NextResponse.json({ message: 'Entry added successfully' });
    } else {
      return NextResponse.json(
        { error: 'Error adding entry' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error adding entry:', error);
    return NextResponse.json(
      { error: 'Error adding entry' },
      { status: 500 }
    );
  }
} 