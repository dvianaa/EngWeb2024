import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Definição de tipos para as entradas e saídas das operações
const FreguesiaInput = z.object({
  searchTerm: z.string().optional(),
  concelho: z.string().optional(),
});

type Freguesia = {
  freguesia: string;
  concelho: string;
};

type Concelho = {
  concelho: string;
};

export const freguesiasRouter = createTRPCRouter({
  getFreguesias: publicProcedure
    .input(FreguesiaInput)
    .query(async ({ input, ctx }) => {
      const { searchTerm, concelho } = input;
      const where: any = {};

      if (searchTerm) {
        where.freguesia = {
          contains: searchTerm,
          mode: "insensitive",
        };
      }

      if (concelho) {
        where.concelho = concelho;
      }

      const freguesias = await ctx.db.rua.findMany({
        where: where,
        select: {
          freguesia: true,
          concelho: true,
        },
        distinct: ['freguesia', 'concelho'],
        orderBy: {
          freguesia: 'asc',
        },
      });

      return freguesias as Freguesia[];
    }),

  getConcelhos: publicProcedure
    .query(async ({ ctx }) => {
      const concelhos = await ctx.db.rua.findMany({
        distinct: ['concelho'],
        select: {
          concelho: true,
        },
      });

      return concelhos.map((item) => ({
        concelho: item.concelho,
      })) as Concelho[];
    }),
});
