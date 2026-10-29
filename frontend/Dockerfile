FROM node:22.23.4-alpine AS dependencies

WORKDIR /package
COPY ./package.json ./yarn.lock ./

RUN yarn install --frozen-lockfile && \
    yarn cache clean

FROM dependencies

WORKDIR /app
COPY . .

RUN mv /package/* . && yarn build

EXPOSE 3000
CMD [ "yarn", "run", "start" ]
