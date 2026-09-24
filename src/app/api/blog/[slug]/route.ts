import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const p = prisma as any;
    const post = await p.blogPost.findUnique({
      where: { slug },
      include: { category: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Related posts in same category
    const related = await p.blogPost.findMany({
      where: {
        categoryId: post.categoryId,
        id: { not: post.id },
      },
      take: 3,
      include: { category: true },
    });

    return NextResponse.json({ post, related });
  } catch (error: unknown) {
    console.error("Fetch blog detail error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch article" },
      { status: 500 }
    );
  }
}
