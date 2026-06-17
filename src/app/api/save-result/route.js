import { MongoClient, ObjectId } from 'mongodb';

export async function POST(req) {
  let client;
  try {
    const body = await req.json();
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();

    const collection = client.db("split_bill_db").collection("bills");
    await collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 });

    const result = await collection.insertOne({ ...body, createdAt: new Date() });

    return Response.json({ success: true, id: result.insertedId.toString() });
  } catch (err) {
    console.error('[save-result POST]', err.message);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  } finally {
    await client?.close();
  }
}

export async function PATCH(req) {
  let client;
  try {
    const { id, ...data } = await req.json();
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();

    await client.db("split_bill_db").collection("bills").updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } }
    );

    return Response.json({ success: true, id });
  } catch (err) {
    console.error('[save-result PATCH]', err.message);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  } finally {
    await client?.close();
  }
}
