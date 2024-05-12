FROM node:lts

WORKDIR /cs30

COPY package*.json ./
COPY .npmrc craco.config.js tsconfig.json tsconfig.paths.json ./

RUN npm install

COPY public/ public/
COPY src/ src/

CMD ["npm", "start"]
