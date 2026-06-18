import { getMenuPageData } from "@/lib/queries";

export const revalidate = 60;

export async function GET() {
  const data = await getMenuPageData();
  return Response.json(data);
}
