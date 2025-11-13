#!/bin/sh

echo "Installing developer requirements" 

docker compose -f ./docker-compose.yml up --build -d 
npm i -g dotenv-cli && \
    npx prisma migrate reset -f && \
    npm run start:dev

