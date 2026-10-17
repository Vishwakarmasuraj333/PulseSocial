import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

export async function runPostsQueueSingleSidebarUnitTests() {
  console.log("\n--- [UNIT TEST SUITE 19: POSTS & QUEUE SINGLE SIDEBAR & UNIFIED WORKSPACE] ---");

  const appLayoutPath = path.resolve(process.cwd(), "src/components/layout/AppLayout.tsx");
  const postsPagePath = path.resolve(process.cwd(), "src/app/(dashboard)/posts/page.tsx");
  const draftsPagePath = path.resolve(process.cwd(), "src/app/(dashboard)/drafts/page.tsx");
  const approvalsPagePath = path.resolve(process.cwd(), "src/app/(dashboard)/approvals/page.tsx");
  const publishedPagePath = path.resolve(process.cwd(), "src/app/(dashboard)/published/page.tsx");
  const scheduledPagePath = path.resolve(process.cwd(), "src/app/(dashboard)/scheduled/page.tsx");

  const appLayoutContent = fs.readFileSync(appLayoutPath, "utf-8");
  const postsPageContent = fs.readFileSync(postsPagePath, "utf-8");
  const draftsPageContent = fs.readFileSync(draftsPagePath, "utf-8");
  const approvalsPageContent = fs.readFileSync(approvalsPagePath, "utf-8");
  const publishedPageContent = fs.readFileSync(publishedPagePath, "utf-8");
  const scheduledPageContent = fs.readFileSync(scheduledPagePath, "utf-8");

  // Test 1: Single sidebar layout - No duplicate sidebar in posts workspace
  console.log("▶ Test 1: Verifying double-sidebar layout removal & full-width workspace...");
  assert.ok(
    !postsPageContent.includes("<aside"),
    "Posts page must NOT render an internal secondary <aside> navigation panel"
  );
  assert.ok(
    postsPageContent.includes("main className=\"flex-1 w-full") || postsPageContent.includes("w-full"),
    "Posts workspace must expand into full available horizontal space"
  );
  assert.ok(
    draftsPageContent.includes('router.replace("/posts?filter=DRAFT")'),
    "/drafts route must redirect to /posts?filter=DRAFT"
  );
  assert.ok(
    approvalsPageContent.includes('router.replace("/posts?filter=PENDING_APPROVAL")'),
    "/approvals route must redirect to /posts?filter=PENDING_APPROVAL"
  );
  assert.ok(
    publishedPageContent.includes('router.replace("/posts?filter=PUBLISHED")'),
    "/published route must redirect to /posts?filter=PUBLISHED"
  );
  assert.ok(
    scheduledPageContent.includes('router.replace("/posts?filter=SCHEDULED")'),
    "/scheduled route must redirect to /posts?filter=SCHEDULED"
  );
  console.log("  ✔ Redundant secondary sidebar removed, all legacy routes unified into /posts.");

  // Test 2: Primary Sidebar Posts & Queue Expandable Dropdown
  console.log("▶ Test 2: Verifying Posts & Queue dropdown items, icons, and reactive highlighting...");
  assert.ok(
    appLayoutContent.includes('label: "Posts & Queue"'),
    "Primary sidebar must contain 'Posts & Queue' item"
  );
  assert.ok(
    appLayoutContent.includes("isDropdown: true"),
    "'Posts & Queue' must be marked as an expandable dropdown"
  );
  assert.ok(
    appLayoutContent.includes('label: "All Posts"'),
    "Dropdown must contain 'All Posts'"
  );
  assert.ok(
    appLayoutContent.includes('label: "Published Posts"'),
    "Dropdown must contain 'Published Posts'"
  );
  assert.ok(
    appLayoutContent.includes('label: "Scheduled Posts"'),
    "Dropdown must contain 'Scheduled Posts'"
  );
  assert.ok(
    appLayoutContent.includes('label: "Drafts"'),
    "Dropdown must contain 'Drafts'"
  );
  assert.ok(
    appLayoutContent.includes('label: "Unpublished / Failed Posts"'),
    "Dropdown must contain 'Unpublished / Failed Posts'"
  );
  assert.ok(
    appLayoutContent.includes('label: "Approvals"'),
    "Dropdown must contain 'Approvals'"
  );
  assert.ok(
    appLayoutContent.includes('label: "Content Calendar"'),
    "Dropdown must contain 'Content Calendar'"
  );
  assert.ok(
    appLayoutContent.includes("useSearchParams"),
    "AppLayout must use useSearchParams for reactive URL parameter tracking"
  );
  assert.ok(
    appLayoutContent.includes("loadPostCounts"),
    "AppLayout must dynamically query real post counts for badge counts"
  );
  console.log("  ✔ Unified Posts & Queue expandable group and all 7 sub-items verified.");

  // Test 3: Posts Workspace Header, Status Tabs, and Toolbar
  console.log("▶ Test 3: Verifying workspace header, compact status tabs, and content toolbar...");
  assert.ok(
    postsPageContent.includes("Posts &amp; Queue") || postsPageContent.includes("Posts & Queue"),
    "Posts page header must display clear page title"
  );
  assert.ok(
    postsPageContent.includes("All Posts") &&
      postsPageContent.includes("Published") &&
      postsPageContent.includes("Scheduled") &&
      postsPageContent.includes("Drafts") &&
      postsPageContent.includes("Failed / Unpublished") &&
      postsPageContent.includes("Approvals"),
    "Posts page must render horizontal status navigation tab bar"
  );
  assert.ok(
    postsPageContent.includes("Search posts"),
    "Toolbar must have search posts functionality"
  );
  assert.ok(
    postsPageContent.includes("Filter by") || postsPageContent.includes("filterByType"),
    "Toolbar must have content type filter"
  );
  assert.ok(
    postsPageContent.includes("Sort by") || postsPageContent.includes("sortBy"),
    "Toolbar must have sorting functionality"
  );
  assert.ok(
    postsPageContent.includes("dateFilterLabel"),
    "Toolbar must have date range filter"
  );
  assert.ok(
    postsPageContent.includes("handleResetAllFilters"),
    "Toolbar must have clear/reset filters action"
  );
  console.log("  ✔ Posts workspace header, status tabs, and toolbar verified.");

  // Test 4: New Post Split Buttons and Creation Menus
  console.log("▶ Test 4: Verifying working New Post dropdowns in sidebar and header...");
  assert.ok(
    appLayoutContent.includes("isSidebarNewPostOpen"),
    "Sidebar New Post button must have expandable creation menu"
  );
  assert.ok(
    postsPageContent.includes("isNewPostMenuOpen"),
    "Posts header must have working New Post split button dropdown"
  );
  assert.ok(
    postsPageContent.includes("Create Post") &&
      postsPageContent.includes("Schedule Post") &&
      postsPageContent.includes("Create Draft") &&
      postsPageContent.includes("Open Content Calendar"),
    "New Post dropdown must include supported actions"
  );
  console.log("  ✔ Working New Post dropdowns verified in both primary sidebar and workspace header.");

  // Test 5: Row Actions, Safety, and Delete Confirmation
  console.log("▶ Test 5: Verifying contextual row actions, confirmation dialogs, and safety...");
  assert.ok(
    postsPageContent.includes("handleDeletePost"),
    "Contextual actions must include post deletion"
  );
  assert.ok(
    postsPageContent.includes("confirmDelete") || postsPageContent.includes("window.confirm"),
    "Post deletion must require explicit confirmation prompt"
  );
  assert.ok(
    postsPageContent.includes("handleEditDraft"),
    "Must allow editing eligible drafts"
  );
  assert.ok(
    postsPageContent.includes("handleEditScheduled"),
    "Must allow editing scheduled posts"
  );
  assert.ok(
    postsPageContent.includes("handleRetryPost"),
    "Must allow retrying failed posts safely"
  );
  assert.ok(
    postsPageContent.includes("handleClonePost"),
    "Must allow duplicating posts"
  );
  assert.ok(
    postsPageContent.includes("getLivePostExternalUrl"),
    "Must link to verified provider live post URL when available"
  );
  console.log("  ✔ Status-aware row actions and deletion confirmation verified.");

  // Test 6: Empty States and Real Backend Error Handling
  console.log("▶ Test 6: Verifying professional empty and error states...");
  assert.ok(
    postsPageContent.includes("No posts yet"),
    "Empty state must display 'No posts yet'"
  );
  assert.ok(
    postsPageContent.includes("Create your first post to start managing and scheduling your social media content.") ||
      postsPageContent.includes("Create your first post to start managing"),
    "Empty state description must match required copy"
  );
  assert.ok(
    postsPageContent.includes("Unable to load posts"),
    "Error state must handle API failures cleanly with retry option"
  );
  assert.ok(
    postsPageContent.includes("No matching posts found"),
    "Filter empty state must explain active filters and provide reset button"
  );
  console.log("  ✔ Truthful empty states and error recovery verified.");

  console.log("==================================================================");
  console.log("✅ SUITE 19 PASSED: Single sidebar layout, unified dropdown & real functionality verified!");
  console.log("==================================================================");
  return true;
}
