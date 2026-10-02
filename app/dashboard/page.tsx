import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAnalysesCollection, getDailyCacheCollection } from "@/lib/mongodb";
import { SkinAnalyzerWithAuth } from "@/components/skin-analysis/skin-analyzer-with-auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const analysesCollection = await getAnalysesCollection();
  const rawHistory = await analysesCollection
    .find({ userId: user.id })
    .sort({ timestamp: -1 })
    .limit(10)
    .toArray();

  const history = rawHistory.map((doc) => ({
    id: doc._id.toString(),
    user_id: doc.userId,
    timestamp:
      doc.timestamp instanceof Date
        ? doc.timestamp.toISOString()
        : String(doc.timestamp),
    image_url: doc.imageUrl || null,
    scores: doc.scores,
    overall_score: doc.overallScore,
    skin_type: doc.skinType,
    concerns: doc.concerns || [],
    recommendations: doc.recommendations || [],
    wearing_glasses: Boolean(doc.wearingGlasses),
    glasses_note: doc.glassesNote || null,
    is_demo: Boolean(doc.isDemo),
  }));

  const today = new Date();
  const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const dailyCacheCollection = await getDailyCacheCollection();
  const rawCache = await dailyCacheCollection.findOne({
    userId: user.id,
    dateKey,
  });

  const dailyCache = rawCache
    ? {
        id: rawCache._id.toString(),
        user_id: rawCache.userId,
        date_key: rawCache.dateKey,
        scores: rawCache.scores,
        skin_type: rawCache.skinType,
        concerns: rawCache.concerns || [],
        recommendations: rawCache.recommendations || [],
        overall_score: rawCache.overallScore,
      }
    : null;

  const profile = {
    id: user.id,
    full_name: user.fullName,
    email: user.email,
    avatar_url: null,
  };

  return (
    <SkinAnalyzerWithAuth
      user={{ id: user.id, email: user.email }}
      profile={profile}
      initialHistory={history}
      initialDailyCache={dailyCache}
    />
  );
}
