import { getNotificationsAction } from "@/app/actions/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getNotificationsAction();
    return Response.json(result);
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return Response.json(
      { success: false, isAdmin: false, notifications: [] },
      { status: 500 }
    );
  }
}
