import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ user: null });
    }
    return Response.json({ user });
  } catch (error) {
    console.error("Auth me error:", error);
    return Response.json({ user: null }, { status: 500 });
  }
}
