// imports
import express from "express";
import mongoose from "mongoose";
import Classes from "./dbClasses.js";
import Pusher from "pusher";
import cors from "cors";

// app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1456712",
  key: "6e02525c07bfefb6d53d",
  secret: "19fa514652a0f700b8f4",
  cluster: "us2",
  useTLS: true,
});

const db = mongoose.connection;

db.once("open", () => {
  console.log("DB connected");

  const classCollection = db.collection("classcontents");
  const changeStream = classCollection.watch();

  changeStream.on("change", (change) => {
    console.log(change);

    if (change.operationType === "insert") {
      const classDetails = change.fullDocument;
      pusher.trigger("classes", "inserted", {
        class: classDetails.class,
        website: classDetails.website,
        canvas: classDetails.canvas,
        syllabus: classDetails.syllabus,
        chat: classDetails.chat,
      });
    } else {
      console.log("Error triggering Pusher");
    }
  });
});

// middleware
app.use(express.json());

app.use(cors());

// DB config
const connection_url =
  "mongodb+srv://admin:vmbTAwQLUAifttP7@cluster0.x5qm3.mongodb.net/vault-mern?retryWrites=true&w=majority";
mongoose.connect(connection_url, {});

// ????

// api routes
app.get("/", (req, res) => res.status(200).send("Hello World"));

app.get("/classes/sync", (req, res) => {
  Classes.find((err, data) => {
    if (err) {
      res.status(404).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post("/classes/new", (req, res) => {
  const dbClass = req.body;

  Classes.create(dbClass, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

// listener
app.listen(port, () => console.log(`Listening on localhost:${port}`));
