import { json, type ActionFunction } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import { prisma } from "~/services/db.server";

export const action: ActionFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const formData = await request.formData();
  const _action = formData.get("_action");

  if (_action === "update") {
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const url = formData.get("url") as string;
    const description = formData.get("description") as string;
    const tags = (formData.get("tags") as string)
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    // 验证书签所有权
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!bookmark) {
      throw new Response("Unauthorized", { status: 403 });
    }

    // 更新书签基本信息
    const updatedBookmark = await prisma.bookmark.update({
      where: { id },
      data: {
        title,
        url,
        description: description || null,
      },
    });

    // 删除现有标签关联
    await prisma.bookmarkTag.deleteMany({
      where: { bookmarkId: id },
    });

    // 创建或获取标签，并建立关联
    for (const tagName of tags) {
      // 查找或创建标签
      const tag = await prisma.tag.upsert({
        where: {
          userId_name: {
            userId: user.id,
            name: tagName,
          },
        },
        create: {
          name: tagName,
          userId: user.id,
        },
        update: {},
      });

      // 创建书签-标签关联
      await prisma.bookmarkTag.create({
        data: {
          bookmarkId: id,
          tagId: tag.id,
        },
      });
    }

    // 获取更新后的完整书签信息
    const finalBookmark = await prisma.bookmark.findUnique({
      where: { id },
      include: {
        collection: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return json({ success: true, bookmark: finalBookmark });
  }

  return json({ success: false, error: "Invalid action" }, { status: 400 });
};
