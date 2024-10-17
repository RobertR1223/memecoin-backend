FROM node:18-alpine AS build

WORKDIR /app

COPY package.json ./

RUN yarn install

COPY . .

COPY .env ./.env

RUN yarn build

FROM node:18-alpine AS production

WORKDIR /app

COPY --from=build /app/package.json ./

COPY --from=build /app/node_modules ./node_modules

COPY .env ./.env

COPY --from=build /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/index.js"]