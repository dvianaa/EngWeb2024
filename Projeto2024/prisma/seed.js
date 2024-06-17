import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';

const prisma = new PrismaClient();

async function seed() {
    try {
        const rawData = await fs.readFile('output.json', 'utf-8');
        const ruas = JSON.parse(rawData);

        for (const ruaData of ruas) {
            const { _id, nome, concelho, freguesia, descricao, figuras, casas } = ruaData;

            // Upsert da rua
            const rua = await prisma.rua.upsert({
                where: { id: _id }, 
                update: { nome, concelho, freguesia, descricao },
                create: { nome, concelho, freguesia, descricao },
            });

            console.log(`Rua "${rua.nome}" adicionada com ID ${rua.id}`);

            // Upsert das figuras associadas à rua
            const figurasCriadas = await prisma.figura.createMany({
                data: figuras.map((/** @type {{ nome: any; path: any; legenda: any; }} */ figuraData) => ({
                    nome: figuraData.nome,
                    path: figuraData.path,
                    legenda: figuraData.legenda,
                    ruaId: rua.id,
                })),
            });

            console.log(`Figuras adicionadas para a rua "${rua.nome}":`, figurasCriadas);

            // Upsert das casas associadas à rua
            const casasCriadas = await prisma.casa.createMany({
                data: casas.map((/** @type {{ numero: any; enfiteuta: any; foro: any; descricao: any; }} */ casaData) => ({
                    numero: casaData.numero,
                    enfiteuta: casaData.enfiteuta || '',
                    foro: casaData.foro || '',
                    descricao: casaData.descricao || '',
                    ruaId: rua.id,
                })),
            });

            console.log(`Casas adicionadas para a rua "${rua.nome}":`, casasCriadas);
        }
        //add Admin
        const admin = await prisma.user.create({
            data: {
                username: 'admin',
                name: 'Admin',
                surname: 'Admin',
                email: 'admin@mail.com',
                password: '$2b$10$CqAPX6JeKpbf3A.9DEpP6.hDt03BCcysUo7RlZ9Ygj0RQn/.ClYVO', // password123
                role: 'admin',
            }
        });

        //add User
        const user = await prisma.user.create({
            data: {
                username: 'johndoe',
                name: 'John',
                surname: 'Doe',
                email: 'johndoe@mail.com',
                password: '$2b$10$fXSGSas6IpYkuNwWDxur/O6Q7YBsR/OCOX8jdEKYKk0HifiR2rJPS', // admin123
                role: 'user',                    
            }
        });


        console.log(`User adicionado: username -> ${user.username}, password -> password123`);
        console.log(`Admin adicionado: username -> ${admin.username}, password -> admin123`);

        console.log('Inserção de dados concluída!');
    } catch (error) {
        console.error('Erro ao inserir dados:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
