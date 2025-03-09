import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = "xJ3$R#d4e5&g7u8*V!X#p$6Jt$2y!W$Q";
const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

async function getUserIdFromToken(request) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const token = cookieHeader.split("token=")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
}

// **DELETE: Remove Expense from Database (Fully Fixed)**
export async function DELETE(request) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) return new Response("Expense ID missing", { status: 400 });

    await client.connect();
    const db = client.db("testDatabase");
    const usersCollection = db.collection("userCollection");

    // Find the user and expenses
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user || !user.budgetData || !user.budgetData.expenses) {
      return new Response(
        JSON.stringify({ message: "User or expenses not found" }),
        { status: 404 }
      );
    }

    // Find the expense and delete it
    const updatedExpenses = user.budgetData.expenses.filter(
      (expense) => expense.id.toString() !== id
    );

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { "budgetData.expenses": updatedExpenses } }
    );

    if (result.modifiedCount === 0) {
      return new Response(
        JSON.stringify({ message: "Expense not found or already deleted" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Expense removed successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting expense:", error);
    return new Response("Internal Server Error", { status: 500 });
  } finally {
    await client.close();
  }
}
