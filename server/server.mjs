import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { expressMiddleware } from "@apollo/server/express4";
import { resolvers } from "./resolvers/index.js";
import { typeDefs } from "./schema/index.js";
import { getAuth } from "firebase-admin/auth";
import "./firebaseConfig.js";
import "dotenv/config";

// Cau hinh graphql server
//__ khi lam viec voi graphql thi ta can nam ro 2 khai niem

const app = express();
const httpServer = http.createServer(app);

//__ thu 1: schema -> giong nhu tai lieu mo ta nhung cai du lieu se bao gom gi
// __ bat dau = #graphql
// __ co 3 type la:
// ____         Query: -> truy van du lieu
// ____         Mutation: -> update/delete du lieu
// ____         subscription: -> update theo dang real time

//__ thu 2: resolver -> tra ve du lieu tu phia client dua theo nhung query ma phia client gui toi

//connect to database
const URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.de41vgk.mongodb.net/?retryWrites=true&w=majority`;
const POST = process.env.POST || 4000;

const schema = makeExecutableSchema({ typeDefs, resolvers });
// Creating the WebSocket server
const wsServer = new WebSocketServer({
  // This is the `httpServer` we created in a previous step.
  server: httpServer,
  // Pass a different path here if app.use
  // serves expressMiddleware at a different path
  path: '/graphql',
});

// Hand in the schema we just created and have the
// WebSocketServer start listening.
const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
  schema,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer }),
  // Proper shutdown for the WebSocket server.
  {
    async serverWillStart() {
      return {
        async drainServer() {
          await serverCleanup.dispose();
        },
      };
    },
  },
  ],
});

// sua ten file thanh mjs thi chung ta co the su dung await truc tiep
// khong can phai boc no trong function async
await server.start();

// cau hinh 1 so middleware
// __ dung md cor() de tranh loi bao cors error

const authorizationJWT = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (authorizationHeader) {
    const accessToken = authorizationHeader.split(" ")[1];
    getAuth()
      .verifyIdToken(accessToken)
      .then((decodedToken) => {
        console.log('decodedToken: ', decodedToken);
        res.locals.uid = decodedToken.uid;
        next();
      })
      .catch((err) => {
        return res.status(403).json({ message: "Forbidden", error: err });
      });
  } else {
    next();
    // return res.status(401).json({ message: "UnAuthorized" });
  }
};

app.use(
  cors(),
  authorizationJWT,
  bodyParser.json(),
  expressMiddleware(server
    , {
    context: async ({ req, res }) => {
      return { uid: res.locals.uid };
    },
  }
  )
);

// mongoose
mongoose.set("strictQuery", false);
mongoose
  .connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to Database");
    await new Promise((resolve) => httpServer.listen({ port: POST }, resolve));
    console.log("🚀 Server ready at http://localhost:4000");
  });
