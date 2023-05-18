FROM node:lts-alpine AS builder

WORKDIR /usr/src/app

COPY . .

RUN npm ci && npm run docker:build

# Copy built and run the program
FROM node:lts-alpine AS runner

WORKDIR /usr/src/app

# Make puppeteer work in Docker
# https://github.com/puppeteer/puppeteer/issues/3994
RUN apk add --no-cache udev ttf-freefont chromium git
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV CHROMIUM_PATH /usr/bin/chromium-browser

COPY --from=builder /usr/src/app/dist ./
COPY --from=builder /usr/src/app/package* ./
COPY --from=builder /usr/src/app/node_modules ./node_modules

USER user

CMD ["npm", "run", "docker:start"]