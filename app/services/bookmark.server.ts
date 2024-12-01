import { prisma } from "~/services/db.server";
import type { ChromeBookmark } from "~/utils/bookmark-parser";

export class BookmarkService {
  static async importBookmarks(userId: string, bookmarks: ChromeBookmark[]) {
    let importedCount = 0;

    try {
      await prisma.$transaction(async (tx) => {
        const processBookmarks = async (
          items: ChromeBookmark[],
          collectionId?: string
        ) => {
          for (const item of items) {
            // 添加日志
            console.log("Processing item:", item.title);

            if (item.url) {
              // 检查是否已存在相同的书签
              const existingBookmark = await tx.bookmark.findFirst({
                where: {
                  userId,
                  url: item.url,
                },
              });

              if (!existingBookmark) {
                await tx.bookmark.create({
                  data: {
                    title: item.title,
                    url: item.url,
                    userId,
                    collectionId,
                  },
                });
                importedCount++; // 计数
                console.log("Created bookmark:", item.title);
              } else {
                console.log("Skipped existing bookmark:", item.title);
              }
            } else if (item.children) {
              // 检查是否已存在相同名称的收藏夹
              let collection = await tx.collection.findFirst({
                where: {
                  userId,
                  name: item.title,
                },
              });

              if (!collection) {
                collection = await tx.collection.create({
                  data: {
                    name: item.title,
                    userId,
                  },
                });
                console.log("Created collection:", item.title);
              }

              // 递归处理子书签
              await processBookmarks(item.children, collection.id);
            }
          }
        };

        await processBookmarks(bookmarks);
      });

      console.log("Import completed. Total imported:", importedCount);
      return { success: true, count: importedCount };
    } catch (error) {
      console.error("Import error in service:", error);
      throw error;
    }
  }
}
