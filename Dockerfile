FROM node:8.11.0-slim

ADD ./dist/ /srv/
WORKDIR /srv
EXPOSE 8080
ENTRYPOINT [ "node", "app.js" ]
