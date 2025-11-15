#!/bin/sh

echo "Installing developer requirements" 

docker compose -f ./docker-compose.yml up --build -d 
cd furnas-backend && \
    npm i -g dotenv-cli && \
    npx prisma migrate reset -f && \
    npm run start:dev

