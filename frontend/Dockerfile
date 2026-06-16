FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY next.config.js ./
RUN npm install --legacy-peer-deps

COPY . .
# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

# Copy standalone output (includes server.js)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

ENV NODE_ENV production
ENV PORT 8080
ENV NEXT_TELEMETRY_DISABLED 1

EXPOSE 8080

CMD ["node", "server.js"]
