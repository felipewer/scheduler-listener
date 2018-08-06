FROM node:8

WORKDIR /usr/src/app/

COPY src ./src/
COPY contract ./contract
COPY package*.json ./

RUN npm install --production

CMD ["node", "src/index.js"]