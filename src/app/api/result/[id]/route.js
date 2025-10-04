import { MongoClient, ObjectId } from 'mongodb';

export async function GET(req, context) {
  const params = await context.params; 
  const { id } = params; 
  
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();

  const db = client.db("split_bill_db");
  const collection = db.collection("bills");

  const result = await collection.findOne({ _id: new ObjectId(id) });

  await client.close();

  if (!result) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }

  delete result._id;
  delete result.createdAt;

  return Response.json(result);
}