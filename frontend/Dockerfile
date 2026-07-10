FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./

# Note: In production, the VITE_BACKEND_URL should be set via build args or environment variables.
# We'll build the static files
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy custom nginx config if necessary, or use default
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
