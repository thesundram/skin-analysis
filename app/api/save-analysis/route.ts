import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAnalysesCollection, getDailyCacheCollection } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { analysis, isFirstOfDay } = body || {};

    if (!analysis) {
      return NextResponse.json({ error: "Analysis data required" }, { status: 400 });
    }

    const analyses = await getAnalysesCollection();
    const now = new Date();

    const analysisDoc = {
      userId: user.id,
      timestamp: analysis.timestamp ? new Date(analysis.timestamp) : now,
      imageUrl: analysis.imageUrl || null,
      scores: analysis.scores,
      overallScore: analysis.overallScore,
      skinType: analysis.skinType,
      concerns: analysis.concerns || [],
      recommendations: analysis.recommendations || [],
      wearingGlasses: Boolean(analysis.wearingGlasses),
      glassesNote: analysis.glassesNote || null,
      isDemo: Boolean(analysis.isDemo),
      createdAt: now,
    };

    const insertResult = await analyses.insertOne(analysisDoc);

    // If first analysis of the day, cache it
    if (isFirstOfDay) {
      const today = new Date();
      const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const dailyCache = await getDailyCacheCollection();
      await dailyCache.updateOne(
        { userId: user.id, dateKey },
        {
          $set: {
            scores: analysis.scores,
            skinType: analysis.skinType,
            concerns: analysis.concerns || [],
            recommendations: analysis.recommendations || [],
            overallScore: analysis.overallScore,
            updatedAt: now,
          },
          $setOnInsert: {
            userId: user.id,
            dateKey,
            createdAt: now,
          },
        },
        { upsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: {
        id: insertResult.insertedId.toString(),
        ...analysisDoc,
      },
    });
  } catch (error) {
    console.error("Save analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error while saving analysis to MongoDB" },
      { status: 500 }
    );
  }
}
