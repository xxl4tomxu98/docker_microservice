
## Stage 1 (production base)
# This gets our prod dependencies installed and out of the way
FROM node:12-alpine as base

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm ci && npm cache clean --force

ENV PATH /app/node_modules/.bin:$PATH


## Stage 2 (development)
# we don't COPY in this stage because for dev you'll bind-mount anyway
# this saves time when building locally for dev via docker-compose
FROM base as dev

ENV NODE_ENV=development

WORKDIR /app

RUN npm install --only=development

CMD ["npm", "start"]


## Stage 3 (build)
# build environment
FROM base as build

# We need to define the env vars for the React app
# so that the build process will have access
# to the values to use for production
ENV REACT_APP_CATALOG_MANAGEMENT_BASE_URL=http://localhost:8081
ENV REACT_APP_CUSTOMER_SUPPORT_BASE_URL=http://localhost:8082

WORKDIR /app

COPY . .

RUN npm run build


## Stage 4 (copy in source for prod)
# This gets our source code into builder
# this stage starts from the first one and skips dev
FROM nginx:stable-alpine as prod

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
