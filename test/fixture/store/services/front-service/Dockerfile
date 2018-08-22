FROM node:alpine

WORKDIR /app

COPY package.json ./
RUN ["npm", "i"]

CMD ["node", "src/index.js"]
