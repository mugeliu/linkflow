import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { PrismaClient } from "@prisma/client";
import { UserLayout } from "~/components/layouts/user-layout";

const prisma = new PrismaClient();

export const loader: LoaderFunction = async ({ request, params }) => {
  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const username = params.username;
  if (!username) {
    throw new Response("Not Found", { status: 404 });
  }

  const pageUser = await prisma.user.findUnique({
    where: { name: username },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      emailVerified: true,
      createdAt: true,
      role: true,
      status: true,
    },
  });

  if (!pageUser) {
    throw new Response("User Not Found", { status: 404 });
  }

  return json({
    pageUser: {
      ...pageUser,
      createdAt: pageUser.createdAt.toISOString(),
    },
    isOwner: currentUser.id === pageUser.id,
  });
};

export default function UserProfile() {
  const { pageUser } = useLoaderData<typeof loader>();

  return (
    <UserLayout user={pageUser}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">用户主页</h1>
        <p className="text-muted-foreground">内容开发中...</p>
      </div>
    </UserLayout>
  );
}
