const express = require("express");
const app = express();

const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/Yelp");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected :)");
});

const Campground = require("./models/campground");

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/makecampground", async (req, res) => {
  const camp = new Campground({ title: "Garden" });
  await camp.save();
  res.send(camp);
});

app.listen("3000", () => {
  console.log("Listening on port 3000 :)");
});
