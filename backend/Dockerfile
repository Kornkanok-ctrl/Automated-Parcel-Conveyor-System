FROM node:18

WORKDIR /app

RUN apt-get update && apt-get install -y netcat-openbsd

COPY package*.json ./
RUN npm install
RUN npm install -g nodemon

COPY . .

RUN npx prisma generate

EXPOSE 7777

CMD ["npm", "run", "nodemon"]
