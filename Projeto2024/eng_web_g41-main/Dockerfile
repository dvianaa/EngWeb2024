FROM node:18

WORKDIR /src/app

COPY package*.json ./

ENV DATABASE_URL "postgresql://postgres:password@postgres:5432/eng_web_g41"

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]