import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureBlogSeeded } from "@/lib/blog/seed";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug).toLowerCase().trim();

    await ensureBlogSeeded(prisma);

    const p = prisma as any;
    let post = await p.blogPost.findUnique({
      where: { slug: decodedSlug },
      include: { category: true },
    });

    if (!post) {
      post = await p.blogPost.findFirst({
        where: {
          OR: [
            { slug: { contains: decodedSlug, mode: "insensitive" } },
            { title: { contains: decodedSlug.replace(/-/g, " "), mode: "insensitive" } },
          ],
        },
        include: { category: true },
      });
    }

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
