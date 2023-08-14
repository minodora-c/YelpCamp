const express = require("express");
const app = express();
// app.use() means that the code inside use() will run for any incoming request
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const ejsMate = require("ejs-mate");
const path = require("path");
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const methodOverride = require("method-override");
app.use(methodOverride("_method"));

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

app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find();
  res.render("campgrounds/index", { campgrounds });
});

app.post("/campgrounds", async (req, res) => {
  let { campground } = req.body;
  let c = new Campground({
    title: campground.title,
    location: campground.location,
  });
  await c.save();
  res.redirect("/campgrounds");
});

app.get("/campgrounds/new", async (req, res) => {
  res.render("campgrounds/new");
});

app.get("/campgrounds/:id", async (req, res) => {
  let id = req.params.id;
  const campground = await Campground.findById(id);
  res.render("campgrounds/show", { campground });
});

app.put("/campgrounds/:id", async (req, res) => {
  let { campground } = req.body;
  let id = req.params.id;
  await Campground.findByIdAndUpdate(id, {
    title: campground.title,
    location: campground.location,
    image: campground.image,
    price: campground.price,
    description: campground.description,
  });
  res.redirect(`/campgrounds/${id}`);
});

app.delete("/campgrounds/:id", async (req, res) => {
  let id = req.params.id;
  await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
});

app.get("/campgrounds/:id/edit", async (req, res) => {
  let id = req.params.id;
  const campground = await Campground.findById(id);
  res.render("campgrounds/edit", { campground });
});

app.listen("3000", () => {
  console.log("Listening on port 3000 :)");
});
