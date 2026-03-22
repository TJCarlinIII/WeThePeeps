import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = process.env.DB as D1Database;
    const { results } = await db.prepare(
      "SELECT * FROM evidence_records LIMIT 1"
    ).all();
    return NextResponse.json({ status: "Connected", data: results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ status: "Error", message }, { status: 500 });
  }
}
