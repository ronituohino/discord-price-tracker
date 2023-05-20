FROM node:lts-alpine AS builder
WORKDIR /usr/src/app
ENV NODE_ENV production

COPY . .

RUN npm ci --omit=dev && npm run docker:build

# Copy built files and run the program
FROM node:lts-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV production

# Create user
ARG DOCKER_PASSWORD
RUN printf "%s\n" $DOCKER_PASSWORD $DOCKER_PASSWORD | adduser nodejs 

COPY --from=builder /usr/src/app/package* ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/schema.sql ./
COPY --from=builder /usr/src/app/dist ./dist

USER nodejs

CMD ["npm", "run", "docker:start"]