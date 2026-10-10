import { NextResponse } from "next/server";
import { DELETE } from "../route";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  return DELETE(req, context);
}
