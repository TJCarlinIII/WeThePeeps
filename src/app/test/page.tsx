export const dynamic = 'force-dynamic';

export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>System Online</h1>
      <p>Cloudflare Worker is successfully executing Next.js 15.</p>
      <p>Time: {new Date().toISOString()}</p>
    </div>
  );
}
