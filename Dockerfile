FROM node

RUN yarn global add typescript
RUN yarn global add react-scripts

COPY tsconfig.json /usr/tsconfig.json

# Setup p2p-adaptor
WORKDIR /usr/src/app/wallet-adapter-p2p
COPY ./packages/wallets/p2p-wallet .
RUN echo $(ls -1)
RUN yarn install
RUN yarn link
RUN tsc

# Setup dApp
WORKDIR /usr/src/app/dapp
RUN git clone https://github.com/p2p-org/p2p-simple-dapp.git .
RUN npm install
RUN yarn link "@solana/wallet-adapter-p2p"

ENV NODE_OPTIONS=--openssl-legacy-provider

EXPOSE 3000
ENTRYPOINT npm run start
