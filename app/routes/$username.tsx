import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUser } from "~/services/auth.server";
import { PrismaClient } from "@prisma/client";
import { UserLayout } from "~/components/layouts/user-layout";

const prisma = new PrismaClient();

interface LoaderData {
  pageUser: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    emailVerified: boolean;
    createdAt: string;
    role: string;
  };
  isOwner: boolean;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const currentUser = await getUser(request);
  const username = params.username;

  if (!username) {
    throw new Response("Not Found", { status: 404 });
  }

  const pageUser = await prisma.user.findUnique({
    where: { name: username },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      emailVerified: true,
      createdAt: true,
      role: true,
    },
  });

  if (!pageUser) {
    throw new Response("User Not Found", { status: 404 });
  }

  const isOwner = currentUser?.id === pageUser.id;

  return json<LoaderData>({
    pageUser: {
      ...pageUser,
      createdAt: pageUser.createdAt.toISOString(),
    },
    isOwner,
  });
};

export default function UserProfile() {
  const { pageUser, isOwner } = useLoaderData<LoaderData>();

  return (
    <UserLayout user={pageUser}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">用户主页</h1>
        <p className="text-muted-foreground">内容开发中...</p>
      </div>
    </UserLayout>
  );
}
