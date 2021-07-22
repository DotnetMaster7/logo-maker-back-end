FROM node:12
COPY . app/
WORKDIR app/
RUN npm install
EXPOSE 8000
ENTRYPOINT npm start