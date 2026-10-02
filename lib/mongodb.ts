import { MongoClient, Db } from "mongodb";

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://thesundram29_db_user:wPQ57AnLs7kagl3s@cluster0.ymzurhh.mongodb.net/?appName=Cluster0";
const dbName = process.env.MONGODB_DB || "skin-analysis";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}

export async function getUsersCollection() {
  const db = await getDb();
  return db.collection("users");
}

export async function getAnalysesCollection() {
  const db = await getDb();
  return db.collection("skin_analyses");
}

export async function getDailyCacheCollection() {
  const db = await getDb();
  return db.collection("daily_analysis_cache");
}

let indexesInitialized = false;
export async function ensureIndexes() {
  if (indexesInitialized) return;
  try {
    const db = await getDb();
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("skin_analyses").createIndex({ userId: 1, timestamp: -1 });
    await db
      .collection("daily_analysis_cache")
      .createIndex({ userId: 1, dateKey: 1 }, { unique: true });
    indexesInitialized = true;
  } catch (err) {
    console.error("MongoDB ensureIndexes error:", err);
  }
}
