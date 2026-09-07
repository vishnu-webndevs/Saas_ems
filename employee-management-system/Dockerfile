FROM serversideup/php:8.2-fpm-nginx

USER root

# Increase Nginx Buffer Size to prevent buffering to temp file
ENV NGINX_CLIENT_BODY_BUFFER_SIZE=50M
ENV NGINX_CLIENT_MAX_BODY_SIZE=50M

COPY . /var/www/html

# Provision mounted volume storage directories and permissions on container boot
COPY docker/init-storage.sh /etc/entrypoint.d/99-init-storage.sh
RUN chmod +x /etc/entrypoint.d/99-init-storage.sh

RUN mkdir -p storage/logs bootstrap/cache storage/app/public \
    storage/framework/cache/data storage/framework/sessions storage/framework/views \
    && chown -R www-data:www-data storage bootstrap/cache storage/app/public public \
    && chmod -R 775 storage bootstrap/cache storage/app/public public \
    && composer install \
        --no-interaction \
        --optimize-autoloader \
        --no-dev \
        --no-scripts \
    && php artisan storage:link || true \
    && chown -h www-data:www-data public/storage

RUN php artisan package:discover --ansi

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -fsS http://localhost:8080/up || exit 1