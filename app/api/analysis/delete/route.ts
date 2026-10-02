import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCurrentUser } from "@/lib/auth";
import { getAnalysesCollection } from "@/lib/mongodb";

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("all") === "true";

    const analysesCollection = await getAnalysesCollection();

    if (clearAll) {
      const result = await analysesCollection.deleteMany({ userId: user.id });
      return NextResponse.json({
        success: true,
        message: "All history records cleared",
        deletedCount: result.deletedCount,
      });
    }

    if (!id) {
      // Also try JSON body if not in query params
      try {
        const body = await req.json();
        if (body.all) {
          const result = await analysesCollection.deleteMany({ userId: user.id });
          return NextResponse.json({
            success: true,
            message: "All history records cleared",
            deletedCount: result.deletedCount,
          });
        }
        if (body.id) {
          return await deleteSingle(body.id, user.id, analysesCollection);
        }
      } catch {
        // Body was not json or empty
      }
      return NextResponse.json({ error: "Analysis ID or all=true required" }, { status: 400 });
    }

    return await deleteSingle(id, user.id, analysesCollection);
  } catch (error) {
    console.error("Error deleting analysis:", error);
    return NextResponse.json({ error: "Failed to delete history record" }, { status: 500 });
  }
}

async function deleteSingle(id: string, userId: string, analysesCollection: any) {
  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "Invalid analysis ID format" }, { status: 400 });
  }

  const result = await analysesCollection.deleteOne({
    _id: objectId,
    userId: userId,
  });

  if (result.deletedCount === 0) {
    return NextResponse.json(
      { error: "Record not found or not owned by user" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Analysis record deleted successfully",
  });
}
