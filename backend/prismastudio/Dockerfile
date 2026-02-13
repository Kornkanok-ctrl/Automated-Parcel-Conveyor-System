FROM node:18-alpine

RUN mkdir /app

WORKDIR /app

RUN npm init -y

RUN npm install prisma --save-dev

CMD [ "sh", "-c", "npx prisma generate && npx prisma studio --port 5555 --hostname 0.0.0.0" ]