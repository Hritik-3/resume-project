# Stage 1: Build Angular
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built files from previous stage
COPY --from=build /app/dist/resume-frontend/browser /usr/share/nginx/html

# Fix Angular routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Optional (only if file exists)
RUN if [ -f /usr/share/nginx/html/index.csr.html ]; then \
    mv /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html; \
    fi

EXPOSE 80