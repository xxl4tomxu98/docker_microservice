
## Stage 1 (production base)
# This gets our prod dependencies installed and out of the way
FROM node:12-alpine as base

EXPOSE 8082

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm ci && npm cache clean --force

ENV PATH=/app/node_modules/.bin:$PATH


## Stage 2 (development)
# we don't COPY in this stage because for dev you'll bind-mount anyway
# this saves time when building locally for dev via docker-compose
FROM base as dev

# RUN apk add --no-cache postgresql-client

ENV NODE_ENV=development

WORKDIR /app

RUN npm install --only=development

CMD ["nodemon", "./bin/www"]


## Stage 3 (copy in source for prod)
# This gets our source code into builder
# this stage starts from the first one and skips dev
FROM base as prod

WORKDIR /app

COPY . .

CMD ["node", "./bin/www"]
