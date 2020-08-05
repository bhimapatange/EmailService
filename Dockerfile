FROM node:carbon-alpine

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# Create app directory
WORKDIR /usr/src/CICD-EMAIL-REPO

ENV NODE_OPTIONS --max-old-space-size=2048

# Install app dependencies
COPY package.json .
# For npm@5 or later, copy package-lock.json as well
# COPY package.json package-lock.json ./

RUN npm install pm2 -g

RUN npm install

# Bundle app source
COPY . .

#CMD [ "export", "NODE_ENV=development" ]
CMD ["pm2-docker", "index.js"]
