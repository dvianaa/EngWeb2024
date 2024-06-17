"use client";

import { useState, useEffect } from "react";
import Search from 'antd/es/input/Search';
import Layout from "../layout";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import PostCard from "../_components/PostCard";
import Navbar from "../_components/Navbar";
import WithRoleProtection from "../_components/withRoleProtection";

type User = {
    id: string;
    username: string;
    email: string | null;
    name: string | null;
    surname: string | null;
    image: string | null;
    posts: Post[];
};

interface Post {
  id: string;
  createdAt: Date;
  commentsNumber: number;
  body: string;
  postId: string;
  userId: string;
  likes: number;
  ruaID: string;
  liked: boolean;
}

export default function Home() {
  const [userData, setUserData] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const session = useSession();

  const userID = session.data?.user.id;

  const { data: dataFetched } = api.user.getUserData.useQuery({id: userID});

  useEffect(() => {
    if (dataFetched) {
      setUserData(dataFetched);
      setUserPosts(dataFetched.posts);
    }
  }, [dataFetched]);

  if (!userID) {
    return <div>Loading...</div>;
  }

  return (
    <WithRoleProtection role="user">
    <Layout>
      <main className="flex h-screen bg-white text-black">
        <Navbar />
        <div className="flex h-full w-full pt-24">
          <div className="bg-[hsl(206,87%,15%)] border rounded-tl-[40px] w-20 p-4"></div>
          <div className="flex-1 pl-10 pr-10">
            <div className="flex mb-4 content-center">
              <h1 className="basis-2/3 text-3xl font-bold">User Profile</h1>
            </div>
            {userData && (
              <div className="mb-4">
                <h2 className="text-lg font-bold">User Information</h2>
                <p>Name: {userData.name}</p>
                <p>Surname: {userData.surname}</p>
                <p>Username: {userData.username}</p>
                <p>Email: {userData.email}</p>
              </div>
            )}
            <div className="mb-4">
              <h2 className="text-lg font-bold">User Posts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
    </WithRoleProtection>
  );
}