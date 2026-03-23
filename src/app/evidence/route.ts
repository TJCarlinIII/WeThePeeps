import { NextRequest, NextResponse } from 'next/server';

// Define the shape of your incoming form data
interface IngressData {
  title: string;
  official: string;
  statute: string;
  content: string;
  organizationId: string;
  isTimelineEvent: boolean;
  isCritical: boolean;
}

// Define the Cloudflare D1 Database type
interface CloudflareEnv {
  DB: {
    prepare: (query: string) => {
      bind: (...args: (string | number)[]) => {
        run: () => Promise<unknown>;
      };
    };
  };
}

export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as IngressData;
    const { title, official, content, isCritical } = data;

    if (!title || !content) {
      return NextResponse.json({ error: 'Missing Required Fields' }, { status: 400 });
    }

    // Use the specific Env type instead of 'any'
    const env = process.env as unknown as CloudflareEnv;
    const db = env.DB; 

    const result = await db.prepare(`
      INSERT INTO evidence_items (
        subject_id, 
        title, 
        content, 
        event_date, 
        is_critical
      ) VALUES (
        (SELECT id FROM subjects WHERE name = ? LIMIT 1),
        ?, 
        ?, 
        CURRENT_TIMESTAMP, 
        ?
      )
    `).bind(official, title, content, isCritical ? 1 : 0).run();

    return NextResponse.json({ success: true, result });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown Database Error';
    return NextResponse.json({ error: 'Database Write Failed', details: message }, { status: 500 });
  }
}