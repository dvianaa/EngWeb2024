import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { hash } from 'bcrypt';


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

export const userRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string().min(6, "Password must be at least 6 characters long!"),
        email: z.string().email(),
        name: z.string().min(1),
        surname: z.string().min(1),
        role: z.string().default('user')
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { username, password, email, name, surname } = input;
      const hashedPassword = await hash(password, 10);
      const user = await ctx.db.user.create({
        data: {
            username,
            password: hashedPassword,
            email,
            name,
            surname,
        },
      });
      return user;
    }),

    getCurrentUser: publicProcedure.query(async ({ ctx }) => {
      const user = ctx.session?.user;
      if (!user) {
        return null;
      }
      return {
        id: user.id,
        username: user.name,
        imageProfile: user.image,
      };
    }),

    getUser: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
      });
      if (!user) {
        return null;
      }
      return {
        id: user.id,
        username: user.name,
        imageProfile: user.image,
      };
    }),

    getUserData: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
        include: {
          posts: {
            include: {
              comments: true,
              likes: true,
            },
          }
        },
      });
      if (!user) {
        return null;
      }
    
      const postsWithUser: Post[] = user.posts.map((post) => ({
        id: post.id,
        commentsNumber: post.comments.length,
        createdAt: post.createdAt,
        body: post.content,
        postId: post.id,
        userId: post.createdById, 
        likes: post.likes.length, 
        ruaID: post.ruaID, 
        liked: post.likes.some(like => like.username === user.username), 
      }));
    
      return {
        id: user.id,
        username: user.username,
        name: user.name,
        surname: user.surname,
        email: user.email,
        image: user.image,
        posts: postsWithUser,
      };
    }),
});
