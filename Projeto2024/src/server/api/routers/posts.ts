import { TRPCError } from "@trpc/server";
import { get } from "http";
import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import { comment } from "postcss";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { getServerAuthSession } from "~/server/auth";

const filterUserInfo = (user: User) => { // this is the filter for user info
  return {
    id: user.id,
    name: user.name,
    image: user.image,
  };
}

interface User {
  id: string;
  name: string | null;
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


export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const sessionPromise = getServerAuthSession().then((session) => {
      if (!session) throw new TRPCError({ code: "UNAUTHORIZED" });
      return session;
    });

    const posts = await ctx.db.post.findMany({
      include: {
        comments: true,
        likes: true,
        createdBy: true,
      },
    });

    const currentUserUsername = (await sessionPromise).user.username;

    const postsWithUser: Post[] = posts.map((post) => ({
      id: post.id,
      commentsNumber: post.comments.length,
      createdAt: post.createdAt,
      body: post.content,
      postId: post.id,
      userId: post.createdById, 
      likes: post.likes.length, 
      ruaID: post.ruaID, 
      liked: false,
    }));

    postsWithUser.forEach((postWithUser) => {
      postWithUser.liked = currentUserUsername 
        ? posts.some(post => post.likes.some(like => like.username === currentUserUsername)) 
        : false;
    });

    return postsWithUser;
  }),

  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {

    const sessionPromisse = getServerAuthSession().then((session) => {
      if (!session) throw new TRPCError({ code: "UNAUTHORIZED" });

      return session;
    });

    const post = await ctx.db.post.findUnique({ 
      where: { id: input.id },
      include: {
        comments: {
          include: {
            user: true, // Include the user who authored the comment
          },
        },
        likes: true, // Include likes related to the post
      },
    });
  
    if (!post) throw new TRPCError({ code: "NOT_FOUND"});

    const numLikes = post.likes.length;
    const currentUserUsername = (await sessionPromisse).user.username

    const liked = currentUserUsername ? post.likes.some(like => like.username === currentUserUsername) : false;

    const formattedComments = post.comments.map((comment) => ({
      id: comment.id,
      author: comment.user.name,
      content: comment.body,
    }));
  
    const user = await ctx.db.user.findUnique({ where: { id: post.createdById }, });
  
    const userFiltered = user ? filterUserInfo(user) : null;
  
    return {
      ...post,
      likes: numLikes,
      comments: formattedComments,
      user: userFiltered,
      liked: liked,
    };
  }),

  likePostMutation: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {

    const sessionPromisse = getServerAuthSession().then((session) => {
      if (!session) throw new TRPCError({ code: "UNAUTHORIZED" });

      return session;
    });
  
    const { id } = input;
    await ctx.db.like.create({
      data: {
        postId: id,
        username: (await sessionPromisse).user.username,
      },
    });
  
    return { success: true };
  }),

  unlikePostMutation: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
  
    const sessionPromisse = getServerAuthSession().then((session) => {
      if (!session) throw new TRPCError({ code: "UNAUTHORIZED" });

      return session;
    });

    const { id } = input;
    await ctx.db.like.deleteMany({
      where: {
        postId: id,
        username: (await sessionPromisse).user.username,
      },
    });

    return { success: true };
  }),

  addCommentPostMutation: protectedProcedure.input(z.object({ postId: z.string(), body: z.string() })).mutation(async ({ ctx, input }) => {
    const sessionPromisse = getServerAuthSession().then((session) => {
      if (!session) throw new TRPCError({ code: "UNAUTHORIZED" });

      return session;
    });

    const { postId, body } = input;

    await ctx.db.comment.create({
      data: {
        postId,
        userId: (await sessionPromisse).user.id,
        body,
      },
    });

    return { success: true };
  }),

  createPostMutation: protectedProcedure.input(z.object({ content: z.string(), ruaid: z.string() })).mutation(async ({ ctx, input }) => {
    const sessionPromisse = getServerAuthSession().then((session) => {
      if (!session) throw new TRPCError({ code: "UNAUTHORIZED" });

      return session;
    });

    const { content, ruaid } = input;

    const post = await ctx.db.post.create({
      data: {
        content,
        createdById: (await sessionPromisse).user.id,
        ruaID: ruaid,
      },
    });

    return { success: true, postID: post.id };
  }),
});
