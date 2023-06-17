FROM node:18-alpine

RUN mkdir /opt/app
WORKDIR /opt/app

COPY package.json /opt/app/package.json

RUN npm install

COPY index.js /opt/app/index.js

ENTRYPOINT ["node", "/opt/app/index.js"]
