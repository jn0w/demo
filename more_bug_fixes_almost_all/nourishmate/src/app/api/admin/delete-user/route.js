import { MongoClient, ObjectId } from "mongodb";

const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

export async function POST(request) {
  try {
    const { userId } = await request.json();
    await client.connect();
    const db = client.db("testDatabase");

    const result = await db.collection("userCollection").deleteOne({
      _id: new ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ message: "User not found." }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({ message: "User deleted successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return new Response("Error deleting user", { status: 500 });
  } finally {
    await client.close();
  }
}
