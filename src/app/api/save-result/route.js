import { MongoClient } from 'mongodb';

export async function POST(req) {
  const body = await req.json();

  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();

  const db = client.db("split_bill_db");
  const collection = db.collection("bills");

  await collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 });

  const newDoc = {
    ...body,
    createdAt: new Date(),
  };

  const result = await collection.insertOne(newDoc);

  await client.close();

  return Response.json({ success: true, id: result.insertedId.toString() });
}
