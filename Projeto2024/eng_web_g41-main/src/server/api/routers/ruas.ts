import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const ruasRouter = createTRPCRouter({
  getRuas: publicProcedure
    .input(
      z.object({
        searchTerm: z.string().optional(),
        freguesia: z.string().optional(),
        concelho: z.string().optional(),
        numCasas: z.number().optional()
      })
    )
    .query(async ({ input, ctx }) => {
      const { searchTerm, freguesia, concelho, numCasas } = input;
      const filterOptions: any = {};

      console.log(process.env.DATABASE_URL)

      if (searchTerm) {
        filterOptions.nome = {
          contains: searchTerm,
          mode: 'insensitive'
        };
      }
      
      if (freguesia) {
        filterOptions.freguesia = freguesia;
      }
      
      if (concelho) {
        filterOptions.concelho = concelho;
      }
      
      if (numCasas) {
        filterOptions.casas = {
          some: {}
        };
      }
      
      return await ctx.db.rua.findMany({
        where: filterOptions,
        include: {
          figuras: true,
          casas: true
        }
      });
      
    }),
  
  getRua: publicProcedure
    .input(z.object({ ruaId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.db.rua.findUnique({
        where: { id: input.ruaId },
        include: {
          figuras: true,
          casas: true
        }
      });
    }),

  deleteRua: publicProcedure
    .input(z.object({ ruaId: z.string() }))
    .mutation(async ({ input, ctx }) => {

    return (await ctx.db.casa.deleteMany({
        where: { ruaId: input.ruaId }
      }))
      &&
      (await ctx.db.figura.deleteMany({
        where: { ruaId: input.ruaId }
      }))
      &&
      (await ctx.db.post.deleteMany({
        where: { ruaID: input.ruaId }
      }))
      &&
      (await ctx.db.rua.delete({
        where: { id: input.ruaId }
      }))

    }),

  getFreguesias: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.rua.findMany({
      distinct: ['freguesia'],
      select: {
        freguesia: true
      }
    });
  }),
  
  getConcelhos: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.rua.findMany({
      distinct: ['concelho'],
      select: {
        concelho: true
      }
    });
  }),

  updateRua: publicProcedure
    .input(
      z.object({
        ruaId: z.string(),
        nome: z.string(),
        descricao: z.string(),
        concelho: z.string(),
        freguesia: z.string(),
        figuras: z.array(
          z.object({
            id: z.string(),
            nome: z.string(),
            path: z.string(),
            legenda: z.string()
          })
        ),
        casas: z.array(
          z.object({
            id: z.string(),
            numero: z.string(),
            enfiteuta: z.string(),
            foro: z.string(),
            descricao: z.string()
          })
        )
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { ruaId, nome, descricao, concelho, freguesia, figuras, casas } = input;

      // Update Rua
      const updatedRua = await ctx.db.rua.update({
        where: { id: ruaId },
        data: {
          nome,
          descricao,
          concelho,
          freguesia,
          figuras: {
            deleteMany: {}, // Remove all existing figuras
            create: figuras.map(figura => ({
              id: figura.id,
              nome: figura.nome,
              path: figura.path,
              legenda: figura.legenda,
            }))
          },
          casas: {
            deleteMany: {}, // Remove all existing casas
            create: casas.map(casa => ({
              id: casa.id,
              numero: casa.numero,
              enfiteuta: casa.enfiteuta,
              foro: casa.foro,
              descricao: casa.descricao,
            }))
          }
        },
        include: {
          figuras: true,
          casas: true
        }
      });

      return updatedRua;
    }),
});
