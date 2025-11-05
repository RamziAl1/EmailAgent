# ---- Base: official Nginx Alpine (tiny) ----
FROM nginx:alpine

# ---- Copy static files ----
COPY index.html styles.css script.js /usr/share/nginx/html/

# ---- Optional: custom Nginx config (caching, security) ----
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# ---- Expose HTTP only (HTTPS handled by reverse proxy) ----
EXPOSE 80