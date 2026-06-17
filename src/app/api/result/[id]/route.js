import { MongoClient, ObjectId } from 'mongodb';

export async function GET(req, context) {
  let client;
  try {
    const { id } = await context.params;
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();

    const result = await client.db("split_bill_db").collection("bills")
      .findOne({ _id: new ObjectId(String(id)) });

    if (!result) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    delete result._id;
    delete result.createdAt;

    return Response.json(result);
  } catch (err) {
    console.error('[result GET]', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  } finally {
    await client?.close();
  }
}
