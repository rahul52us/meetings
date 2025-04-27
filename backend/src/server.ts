/* eslint-disable wrap-iife */
import express from 'express'
import mongoose from 'mongoose'

import compression from 'compression'
import cors from 'cors'
import session from 'express-session'

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { default as connectMongoDBSession } from 'connect-mongodb-session';
import routes from './routes'
import Auth from './routes/auth.route'
import User from './routes/user.route'
import Account from './repository/schemas/accounts.schema'
import { MONGODB_URI } from "./utils/env";
import Role from './routes/role.route'
import Files from './routes/files.route'
import ApiKey from './routes/apikey.route'
import Logs from './routes/log.route'
import Extract from './routes/extract.route'
import RequestDemo from "./routes/requestdemo.route";
import Pdfdetails from "./routes/pdfdetails.route"
import FileUpload from './routes/fileSystem.route'

class Server {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
    this.mongo();
    this.passport();
  }

  public routes(): void {
    this.app.use("/", routes);
    this.app.use("/auth", Auth);
    this.app.use("/user", User);
    this.app.use("/role", Role);
    this.app.use("/extract", Extract);
    this.app.use("/upload", Files);
    this.app.use("/apikey", ApiKey);
    this.app.use("/logs", Logs);
    this.app.use("/fileupload", FileUpload);
    this.app.use("/requestdemo", RequestDemo);
    this.app.use("/pdfdetails", Pdfdetails);
    // this.app.use('/organisation', organisation);
  }

  public config(): void {
    this.app.set("port", process.env.PORT || 3000);
    this.app.set("host", process.env.HOSTNAME || "localhost");
    this.app.use(express.json({ limit: "500mb" }));
    this.app.use(express.text({ limit: "500mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "500mb" }));
    this.app.use(compression());
    this.app.use(cors());
    this.app.set("trust proxy", 1);
    this.app.use(function (req, res, next) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      next();
    });

    const MongoDBStore = connectMongoDBSession(session);

    var store = new MongoDBStore({
      uri: MONGODB_URI,
      collection: "sessions",
    });

    this.app.use(
      session({
        secret: "sadsdsfdsfdfrrttryrtyytu67868fdsfsdfs",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true },
        store: store,
      })
    );
  }

  private passport(): void {
    this.app.use(passport.initialize());
    this.app.use(passport.session());

    passport.use(new LocalStrategy(Account.authenticate()));

    passport.serializeUser(Account.serializeUser());
    passport.deserializeUser(Account.deserializeUser());
  }

  private mongo(): void {
    const connection = mongoose.connection;
    connection.on("connected", () => {
      console.log("Mongo Connection Established");
    });
    connection.on("reconnected", () => {
      console.log("Mongo Connection Reestablished");
    });
    connection.on("disconnected", () => {
      console.log("Mongo Connection Disconnected");
      console.log("Trying to reconnect to Mongo ...");
      setTimeout(() => {
        mongoose.connect(MONGODB_URI, {
          keepAlive: true,
          socketTimeoutMS: 3000,
          connectTimeoutMS: 3000,
        });
      }, 3000);
    });
    connection.on("close", () => {
      console.log("Mongo Connection Closed");
    });
    connection.on("error", (error: Error) => {
      console.log("Mongo Connection ERROR: " + error);
    });

    mongoose.set("strictQuery", false);
    const run = async () => {
      await mongoose.connect(MONGODB_URI, {
        keepAlive: true,
      });
    };
    run().catch((error) => console.error(error));
  }

  public start(): void {
    this.app.listen(this.app.get("port"), this.app.get("host"), () => {
      console.log(
        ` API is running at ${this.app.get("host")}:${this.app.get("port")}`
      );
    });
  }
}


const server = new Server()

server.start()