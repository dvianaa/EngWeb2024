"use client";

import Image from "next/image";
import { HeartOutlined, CommentOutlined, HeartFilled } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { api } from "~/trpc/react";

interface Rua {
  id: string;
  name: string;
  image: string | null;
}

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

const PostCard = ({ post }: { post: Post }) => {
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);
  const [rua, setRua] = useState<Rua | null>(null);
  const unlikePostMutation = api.posts.unlikePostMutation.useMutation();
  const likePostMutation = api.posts.likePostMutation.useMutation();



  const router = useRouter();

  const { data: ruaData, refetch: refetchRua } = api.ruas.getRua.useQuery(
    { ruaId: post.ruaID as string },
    { enabled: !! post.ruaID }
  );

  const {data: user } = api.user.getUser.useQuery({ id: post.userId });

  useEffect(() => {
    if (ruaData) {
      setRua({
        id: ruaData.id,
        name: ruaData.nome,
        image: `/${ruaData.figuras[0]?.path}`,
      });
    }
  }, [ruaData]);

  const handleLikeClick = async (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    try {
      e.stopPropagation();
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

  const handleCommentClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    e.stopPropagation(); // Prevent the click event from propagating to the card's onClick
    router.push(`/posts/${post.id}`);
    console.log("Comment clicked");
  };

  const handleCardClick = () => {
    router.push(`/posts/${post.id}`);
  };

  const defaultImage = "/imgs/defaultavatar.png";
  const postImage = rua?.image;

  return (
    <div
      className="border rounded-lg shadow-md mb-4 bg-white flex flex-col transition-all hover:scale-105 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
        {postImage && (
          <Image
            src={postImage}
            alt={rua.name}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
          />
        )}
      </div>
      <div className="flex flex-col flex-grow p-4">
        <div>
          <h2 className="text-xl font-bold">{rua?.name}</h2>
          <p className="text-gray-700 mt-2">{post.body}</p>
        </div>
        <div className="flex justify-between items-center mt-auto px-4 pt-4">
          <div className="flex items-center">
            <Image
              src={user?.imageProfile ?? defaultImage}
              width={30}
              height={30}
              alt="Avatar"
              className="rounded-full"
            />
            <span className="ml-2 text-gray-600">{user?.username}</span>
            <span className="pl-10 ml-2 text-gray-600">
              {new Intl.DateTimeFormat('en-US', { 
                weekday: 'short', 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric', 
                hour: 'numeric', 
                hour12: true 
              }).format(new Date(post.createdAt))}
            </span>
          </div>
          <div className="flex items-center gap-4">
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
            <span
              className="flex items-center gap-1 cursor-pointer"
              onClick={handleCommentClick}
            >
              <CommentOutlined />
              {post.commentsNumber}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
