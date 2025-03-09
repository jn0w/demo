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

export async function POST(request) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const mealData = await request.json();
    const { date, meals } = mealData;

    await client.connect();
    const db = client.db("testDatabase");
    const mealLogCollection = db.collection("mealLogs");

    // Check if there's already an entry for this date and user
    const existingLog = await mealLogCollection.findOne({
      userId: new ObjectId(userId),
      date: date,
    });

    let result;

    if (existingLog) {
      // Update existing log
      result = await mealLogCollection.updateOne(
        { userId: new ObjectId(userId), date: date },
        { $set: { meals: meals } }
      );
    } else {
      // Create new log
      result = await mealLogCollection.insertOne({
        userId: new ObjectId(userId),
        date: date,
        meals: meals,
        createdAt: new Date(),
      });
    }

    // Check for achievements
    const userCollection = db.collection("userCollection");
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });
    const userAchievements = user.achievements || [];

    // Count total meals logged by this user
    const totalLogs = await mealLogCollection.countDocuments({
      userId: new ObjectId(userId),
    });

    const newAchievements = [];

    // Import achievements from central file (you would need to import at the top)
    // For simplicity, I'm hardcoding the meal achievements
    const mealAchievements = [
      {
        id: "meal_track_first",
        name: "First Meal",
        description: "Tracked your first meal!",
        icon: "🍽️",
        requirement: 1,
      },
      {
        id: "meal_track_fifty",
        name: "Food Logger",
        description: "Tracked 50 meals!",
        icon: "📝",
        requirement: 50,
      },
    ];

    // Check for meal logging achievements
    mealAchievements.forEach((achievement) => {
      if (
        totalLogs >= achievement.requirement &&
        !userAchievements.some((a) => a.id === achievement.id)
      ) {
        newAchievements.push({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          earnedAt: new Date().toISOString().split("T")[0],
        });
      }
    });

    // Award new achievements if any
    if (newAchievements.length > 0) {
      await userCollection.updateOne(
        { _id: new ObjectId(userId) },
        {
          $push: {
            achievements: {
              $each: newAchievements,
            },
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: existingLog ? "Meal log updated" : "Meal log created",
        newAchievements: newAchievements.length > 0 ? newAchievements : null,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error logging meal:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.close();
  }
}
