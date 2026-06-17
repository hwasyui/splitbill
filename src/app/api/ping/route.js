import { MongoClient } from 'mongodb';

export async function GET() {
  let client;
  try {
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    await client.db("split_bill_db").command({ ping: 1 });
    return Response.json({ ok: true, ts: new Date().toISOString() });
  } catch (err) {
    console.error('[ping]', err.message);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  } finally {
    await client?.close();
  }
}
