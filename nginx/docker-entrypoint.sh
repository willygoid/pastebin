#!/bin/sh
set -e

envsubst '$NGINX_SERVER_NAME $BACKEND_UPSTREAM_HOST $BACKEND_UPSTREAM_PORT $FRONTEND_UPSTREAM_HOST $FRONTEND_UPSTREAM_PORT' \
  < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

exec "$@"
