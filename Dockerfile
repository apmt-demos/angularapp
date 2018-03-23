FROM ibmcom/ibmnode

WORKDIR "/app"

# Install app dependencies
RUN apt-get update \
 && echo 'Finished installing dependencies'
RUN cd /app; npm install --production
RUN npm install --only=dev; npm run build; npm prune --production

COPY . .

ENV NODE_ENV production
ENV PORT 3000

EXPOSE 3000
CMD ["npm", "start"]
