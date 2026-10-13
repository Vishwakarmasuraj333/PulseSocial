const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Starting Brownmonkeytv devloper synchronization across Suraj workspaces...");

  const surajEmails = [
    "itsurajvishwa@gmail.com",
    "itxsurajofficial@gmail.com",
    "itsurya9930@gmail.com",
    "admin@pulsesocial.io",
  ];

  const users = await prisma.user.findMany({
    where: { email: { in: surajEmails } },
    include: { memberships: { include: { organization: true } } },
  });

  const orgIds = new Set();
  for (const u of users) {
    for (const m of u.memberships) {
      orgIds.add(m.organizationId);
    }
  }

  const fbPostContent = `🎬 Title

Office Mein Pyaar ❤️🐒 | Bittu ❤️ Uma | BrownMonkeyTV | Cute Office Love Story

📱 Caption

Office ka kaam tha… par dil Uma pe aa gaya ❤️🐒😍
Bittu & Uma ki cute office love story! 💕✨

🔥 Hashtags

#BrownMonkeyTV #BittuUma #MonkeyLove #OfficeLove #CuteCouple LoveStory BrownMonkey MonkeyCouple RomanticVideo ViralShorts YouTubeShorts Shorts Trending ViralVideo AIAnimation`;

  const fbPostMediaUrl = "https://scontent.fbom19-3.fna.fbcdn.net/v/t51.71878-10/779867099_1021584257358444_1996718888565369779_n.jpg?_nc_cat=107&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=5fad0e&_nc_ohc=KGCDxhpWVngQ7kNvwFRYXd7&_nc_oc=AdrgO0KbktFbHOTwui4dKr2JbTiAk1X8pP7tZDdj31ernSkt6ojAuAXN2A8Zuhi21EU&_nc_zt=23&_nc_ht=scontent.fbom19-3.fna&edm=AKIiGfEEAAAA&_nc_gid=5JaMcHU0MpJEtUDAhZYXMQ&_nc_tpa=Q5bMBQIE2Dy7_L_eAvP4NPnfQBplPAqX5ORVXllJE2JETbWBS5Jnnrve1qGdMzx8xD0ZVmziLBcyq9J8&oh=00_AQNIx8CQFaKjN_uQhDqKZgRiiyjUlrbq08saHhYSYJYuRA&oe=6AD3BE94";

  for (const orgId of orgIds) {
    console.log(`\nSyncing real Brownmonkeytv devloper for Org: ${orgId}`);

    // 1. Upsert real Facebook Account
    const fbAccount = await prisma.socialAccount.upsert({
      where: {
        organizationId_provider_providerAccountId: {
          organizationId: orgId,
          provider: "facebook",
          providerAccountId: "1290375347485246",
        },
      },
      create: {
        organizationId: orgId,
        provider: "facebook",
        providerAccountId: "1290375347485246",
        displayName: "Brownmonkeytv devloper",
        username: "brownmonkeytv",
        profileImageUrl: "https://graph.facebook.com/1290375347485246/picture?width=100&height=100",
        accountType: "PAGE",
        status: "CONNECTED",
        scopes: '["public_profile","pages_show_list","pages_read_engagement","pages_manage_posts"]',
        metadata: JSON.stringify({
          pageId: "1290375347485246",
          pageName: "Brownmonkeytv devloper",
          syncPosts: true,
          liveStreamSupported: true,
        }),
        lastSyncedAt: new Date(),
      },
      update: {
        displayName: "Brownmonkeytv devloper",
        username: "brownmonkeytv",
        profileImageUrl: "https://graph.facebook.com/1290375347485246/picture?width=100&height=100",
        accountType: "PAGE",
        status: "CONNECTED",
        lastSyncedAt: new Date(),
      },
    });

    // 2. Upsert real Profile: 4 Followers, 0 Following, 1 Post
    await prisma.socialProfile.upsert({
      where: { socialAccountId: fbAccount.id },
      create: {
        socialAccountId: fbAccount.id,
        bio: "BrownMonkeyTV Official Developer Page. Animated Shorts, Stories & Creative Media.",
        followersCount: 4,
        followingCount: 0,
        postsCount: 1,
      },
      update: {
        followersCount: 4,
        followingCount: 0,
        postsCount: 1,
      },
    });

    // 3. Resolve creator ID
    const member = await prisma.organizationMember.findFirst({
      where: { organizationId: orgId },
      select: { userId: true },
    });
    const creatorId = member?.userId || "cmuxrhe4h0000kz042f280q2u";

    // 4. Upsert Real Facebook Post
    const existingTarget = await prisma.socialPostTarget.findFirst({
      where: {
        socialAccountId: fbAccount.id,
        platformPostId: "1290375347485246_122109172821430415",
      },
      include: { post: true },
    });

    let postId;
    if (existingTarget) {
      postId = existingTarget.postId;
      await prisma.socialPost.update({
        where: { id: postId },
        data: {
          content: fbPostContent,
          status: "PUBLISHED",
          publishedAt: new Date("2026-08-18T21:21:00Z"),
        },
      });
    } else {
      const newPost = await prisma.socialPost.create({
        data: {
          organizationId: orgId,
          creatorId,
          content: fbPostContent,
          status: "PUBLISHED",
          publishedAt: new Date("2026-08-18T21:21:00Z"),
          createdAt: new Date("2026-08-18T21:21:00Z"),
          targets: {
            create: {
              socialAccountId: fbAccount.id,
              platformPostId: "1290375347485246_122109172821430415",
              status: "PUBLISHED",
              publishedAt: new Date("2026-08-18T21:21:00Z"),
            },
          },
          media: {
            create: {
              url: fbPostMediaUrl,
              mediaType: "IMAGE",
              altText: "Office Mein Pyaar | Bittu & Uma | BrownMonkeyTV",
              orderIndex: 0,
            },
          },
        },
      });
      postId = newPost.id;
    }

    // 5. Upsert Engagement Snapshot: 2 Likes, 0 Comments, 5 Reach
    await prisma.socialEngagementSnapshot.upsert({
      where: {
        platform_externalPostId: {
          platform: "facebook",
          externalPostId: "1290375347485246_122109172821430415",
        },
      },
      create: {
        postId,
        socialAccountId: fbAccount.id,
        platform: "facebook",
        externalPostId: "1290375347485246_122109172821430415",
        externalPostUrl: "https://facebook.com/1290375347485246_122109172821430415",
        likes: 2,
        reactions: 2,
        comments: 0,
        shares: 0,
        reach: 5,
        impressions: 5,
        lastSyncedAt: new Date(),
      },
      update: {
        postId,
        likes: 2,
        reactions: 2,
        comments: 0,
        shares: 0,
        reach: 5,
        impressions: 5,
        lastSyncedAt: new Date(),
      },
    });

    // 6. Upsert Real Analytics: Followers: 4, Reach: 5, Impressions: 5, Engagements: 2
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.socialAnalytics.upsert({
      where: {
        socialAccountId_metricDate: {
          socialAccountId: fbAccount.id,
          metricDate: today,
        },
      },
      create: {
        socialAccountId: fbAccount.id,
        metricDate: today,
        followers: 4,
        following: 0,
        impressions: 5,
        reach: 5,
        engagementCount: 2,
        engagementRate: 40.0,
        clicks: 1,
        shares: 0,
        saves: 0,
        isCalculated: true,
      },
      update: {
        followers: 4,
        following: 0,
        impressions: 5,
        reach: 5,
        engagementCount: 2,
        engagementRate: 40.0,
      },
    });

    console.log(`✓ Brownmonkeytv devloper synced successfully for ${orgId}`);
  }

  console.log("\nAll Suraj workspaces synced with real Brownmonkeytv devloper data!");
}

main()
  .catch((e) => {
    console.error("Sync error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
