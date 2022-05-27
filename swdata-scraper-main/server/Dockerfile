FROM node:14-alpine

# Create app directory
WORKDIR /usr/src/app

# For some NPM packages
RUN apk add --no-cache git python2 g++ make

# PM2
RUN yarn global add pm2

COPY package*.json ./
RUN yarn install

COPY tsconfig.json ./tsconfig.json

COPY ./src/resources ./build/resources

COPY types ./types
COPY global.d.ts ./global.d.ts

COPY ecosystem.config.js ./ecosystem.config.js
COPY src ./src

RUN yarn run dist:docker

EXPOSE 8080
CMD ["pm2-runtime", "ecosystem.config.js"]