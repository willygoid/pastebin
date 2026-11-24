FROM alpine:latest
COPY --from=cloudflare/cloudflared:latest /usr/local/bin/cloudflared /usr/local/bin/cloudflared

RUN apk add --no-cache ca-certificates tzdata

CMD if [ "$USE_TUNNEL" = "true" ]; then \
    echo "Starting Cloudflare Tunnel..."; \
    cloudflared tunnel run; \
    else \
    echo "USE_TUNNEL is set to false. Cloudflare Tunnel is disabled."; \
    sleep infinity; \
    fi
