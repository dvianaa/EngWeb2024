"use client";

import Layout from "../layout";
import PostCard from "../_components/PostCard";
import Navbar from "../_components/Navbar";
import { api } from "~/trpc/react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Post {
  id: string;
  createdAt: Date;
  body: string;
  postId: string;
  userId: string;
  likes: number;
  ruaID: string;
  liked: boolean;
  commentsNumber: number;
}

export default function Home() {
  const [sortCriteria, setSortCriteria] = useState('all');
  const [posts, setPosts] = useState<Post[]>([]);

  const { data: fetchedPosts, isLoading, isError } = api.posts.getAll.useQuery();

  const session = useSession();
  const router = useRouter();

  if (!session.data) {
    router.push("/");
  }

  useEffect(() => {
    if (fetchedPosts) {
      setPosts(fetchedPosts);
    }
  }, [fetchedPosts]);

  const handleSort = (criteria: string) => {
    setSortCriteria(criteria);
  };

  const sortedPosts = () => {
    switch (sortCriteria) {
      case 'newest':
        return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'popular':
        return [...posts].sort((a, b) => b.likes - a.likes);
      default:
        return posts;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !posts) {
    return <div>Error loading posts</div>;
  }

  return (
    <Layout>
      <div className="flex h-screen">
        <Navbar />
        <main className="flex flex-1 bg-white pt-4">
          <div className="flex h-full w-full pt-24">
            <div className="bg-[hsl(206,87%,15%)] border rounded-tl-[40px] w-20 p-4"></div>
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
              <h1 className="text-3xl font-bold mb-6">Posts</h1>
              <div className="flex gap-2 mb-4">
                <button
                  className={`px-4 py-2 rounded-full ${sortCriteria === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => handleSort('all')}
                >
                  All
                </button>
                <button
                  className={`px-4 py-2 rounded-full ${sortCriteria === 'popular' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => handleSort('popular')}
                >
                  Popular
                </button>
                <button
                  className={`px-4 py-2 rounded-full ${sortCriteria === 'newest' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => handleSort('newest')}
                >
                  Newest
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sortedPosts().map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
            <div className="relative flex flex-col items-start w-470 bg-transparent">
              <div className="w-full h-full pt-5 pl-5 pr-20 bg-gray-100 shadow-md rounded-l-2xl">
                <h2 className="text-xl font-bold mb-4">Your activity</h2>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
