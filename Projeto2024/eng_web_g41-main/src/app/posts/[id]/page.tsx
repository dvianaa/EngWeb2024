"use client";

import Layout from "../../layout";
import Navbar from "../../_components/Navbar";
import { api } from "~/trpc/react";
import { NextPage } from "next";
import HeartFilled from "@ant-design/icons/lib/icons/HeartFilled";
import HeartOutlined from "@ant-design/icons/lib/icons/HeartOutlined";
import { useEffect, useState } from "react";
import RuaCard from "../../_components/RuaCard";
import { useParams } from "next/navigation";

interface Comment {
  id: number;
  author: string | null;
  content: string;
}

interface User {
  id: string;
  name: string | null;
  image: string | null;
}

interface Post {
  id: string;
  user: User | null;
  createdAt: Date;
  content: string;
  likes: number;
  createdById: string;
  liked: boolean;
  ruaID: string;
  comments: Comment[];
}

export default function PostPage() {
  const params = useParams();
  const postID = params.id;

  const { data: fetchedPost, isLoading, isError } = api.posts.getById.useQuery({ id: postID as string });
  const unlikePostMutation = api.posts.unlikePostMutation.useMutation();
  const likePostMutation = api.posts.likePostMutation.useMutation();
  const addCommentPostMutation = api.posts.addCommentPostMutation.useMutation();
  const [post, setPost] = useState<Post | null>(null);

  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    if (fetchedPost) {
      setPost(fetchedPost);
      setLiked(fetchedPost.liked);
      setLikes(fetchedPost.likes);
    }
  }, [fetchedPost]);

  const [commentContent, setCommentContent] = useState("");
  
  const rua = post?.ruaID;
  
  const { data: ruaData, refetch: refetchRua } = api.ruas.getRua.useQuery(
    { ruaId: rua as string },
    { enabled: !!rua }
  );

  const transformedRuaData = {
    ...ruaData,
    figuras: ruaData?.figuras.map(figura => ({
      ...figura,
      path: `/../${figura.path}`,
    })),
  };
  
  if (!post) {
    return <div>Loading...</div>;
  }

  if (!ruaData) {
    return <div>Loading rua...</div>;
  }

  const handleCommentSubmit = async () => {
    try {
      const data = await addCommentPostMutation.mutateAsync({
        postId: post.id,
        body: commentContent,
      });
  
      if (data?.success) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  

  const handleLikeClick = async () => {
    try {
      const mutation = liked ? unlikePostMutation : likePostMutation;
      const data = await mutation.mutateAsync({ id: post.id });
  
      if (data?.success) {
        setLiked(!liked);
        setLikes(liked ? likes as number - 1 : likes as number + 1);
      }
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };



  return (
    <Layout>
      <div className="flex flex-col h-screen">
        <Navbar />
        <main className="flex bg-white pt-32">
          <div className="bg-blue-950 border rounded-tl-[40px] w-20 p-4 h-screen sticky top-0"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex space-x-4 items-center w-full">
                  <div className="bg-gray-300 w-16 h-16 rounded-full overflow-hidden">
                    {post.user?.image && (
                      <img
                        src={post.user.image ?? undefined}
                        alt={post.user.name ?? "User"}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold">@{post.user?.name}</h2>
                </div>
                  <div>
                    <p className="text-gray-600">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="mt-2">{post.content}</p>
                  <div className="flex items-center gap-2 mt-4">
                    <span
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={handleLikeClick}
                    >
                      {liked ? (
                        <HeartFilled style={{ color: "red" }} />
                      ) : (
                        <HeartOutlined />
                      )}
                      {likes}
                    </span>
                  </div>
                </div>
                <div className="w-2/5 pb-3">
                    <RuaCard key={transformedRuaData.id} rua={transformedRuaData} level="../"/>
                </div>
              </div>
              <div className="w-200 bg-gray-100 p-4 rounded-lg">
                <div className="mb-4">
                    <h4 className="text-lg font-bold mb-2">Leave your comment here:</h4>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="Write here..."
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                    ></textarea>
                    <button
                      className="px-4 py-2 mt-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      onClick={handleCommentSubmit}
                    >
                      Submit
                    </button>
                </div>
                <h3 className="text-xl font-bold mb-4">
                  Comments ({post.comments.length})
                </h3>
                {post.comments.map((comment) => (
                  <div key={comment.id} className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="bg-gray-300 w-8 h-8 rounded-full"></div>
                      <span>@{comment.author}</span>
                    </div>
                    <p>{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
        </main>
      </div>
    </Layout>
  );
};

  

