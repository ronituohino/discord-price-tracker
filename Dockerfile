FROM node:lts-alpine AS builder

WORKDIR /usr/src/app

COPY . .

RUN npm ci && npm run docker:build

# Copy built files and run the program
FROM node:lts-alpine AS runner

WORKDIR /usr/src/app

ARG DOCKER_PASSWORD

# Make puppeteer work in Docker by installing chromium manually, create user
# https://github.com/puppeteer/puppeteer/issues/3994
RUN apk add --no-cache udev ttf-freefont chromium git && \
  printf "%s\n" $DOCKER_PASSWORD $DOCKER_PASSWORD | adduser nodejs 

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV CHROMIUM_PATH /usr/bin/chromium-browser

COPY --from=builder /usr/src/app/package* ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/schema.sql ./
COPY --from=builder /usr/src/app/dist ./dist

USER nodejs

CMD ["npm", "run", "docker:start"]