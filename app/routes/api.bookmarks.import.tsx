import { json, type ActionFunction } from "@remix-run/node";
import { requireUser } from "~/services/auth.server";
import { BookmarkService } from "~/services/bookmark.server";

export const action: ActionFunction = async ({ request }) => {
  try {
    const user = await requireUser(request);
    const formData = await request.formData();
    const bookmarksJson = formData.get("bookmarks") as string;

    if (!bookmarksJson) {
      return json({ error: "No bookmarks provided" }, { status: 400 });
    }

    const bookmarks = JSON.parse(bookmarksJson);

    console.log("Importing bookmarks for user:", user.id);
    console.log("Bookmarks count:", bookmarks.length);

    const result = await BookmarkService.importBookmarks(user.id, bookmarks);

    return json({
      success: true,
      message: "书签导入成功",
      count: result.count,
    });
  } catch (error) {
    console.error("Import error:", error);
    return json(
      {
        error:
          error instanceof Error ? error.message : "Failed to import bookmarks",
      },
      { status: 500 }
    );
  }
};
