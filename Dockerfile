FROM node:alpine AS builder

WORKDIR /app

COPY . .

RUN yarn --network-timeout 120000 && yarn build --prod

FROM nginx:alpine

COPY --from=builder /app/dist/* /usr/share/nginx/html/

ENV LATEX_RENDERER_HOST_NAME localhost
ENV LATEX_RENDERER_PORT 8083
ENV CONFIG_SERVER config-server
ENV CONFIG_SERVER_PORT 2379

WORKDIR /app

ADD .docker/features.json /opt/init-config.d/features.json
ADD .docker/config-init.sh config-init.sh

RUN apk add --no-cache jq bash \
    && mkdir -p /opt/init-config.d \
    && wget https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -O /usr/bin/wait-for-it \
    && chmod +x /usr/bin/wait-for-it \
    && chmod +x config-init.sh

# When the container starts, replace the env.js with values from environment variables
CMD ["/bin/sh",  "-c",  "/app/config-init.sh && envsubst < /usr/share/nginx/html/assets/env.js.template > /usr/share/nginx/html/assets/env.js && exec nginx -g 'daemon off;'"]
