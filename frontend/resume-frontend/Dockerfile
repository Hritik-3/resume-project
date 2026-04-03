FROM nginx:alpine

COPY dist/resume-frontend/browser /usr/share/nginx/html

# Fix Angular routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN mv /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html

EXPOSE 80