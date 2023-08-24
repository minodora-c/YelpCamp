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
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");

// remember that the order of the paths is important, as the first one that matches the request will be executed

app.get("/", (req, res) => {
  res.render("home");
});

app.get(
  "/campgrounds",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find();
    res.render("campgrounds/index", { campgrounds });
  })
);

app.post(
  "/campgrounds",
  catchAsync(async (req, res) => {
    // you can throw an error and it will be caught by catchAsync and handled in app.use(...)
    if (!req.body.campground)
      throw new ExpressError("Invalid Campground Data", 400);
    let { campground } = req.body;
    let c = new Campground({
      title: campground.title,
      location: campground.location,
    });
    await c.save();
    res.redirect("/campgrounds");
  })
);

app.get(
  "/campgrounds/new",
  catchAsync(async (req, res) => {
    res.render("campgrounds/new");
  })
);

// try-catch is one way of handling errors
// however, is there are many paths, wrappinf the function in catchAsync is übersichtlicher und kürzer
app.get("/campgrounds/:id", async (req, res, next) => {
  try {
    let id = req.params.id;
    const campground = await Campground.findById(id);
    res.render("campgrounds/show", { campground });
  } catch (e) {
    next(e);
  }
});

app.put(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
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
  })
);

app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    let id = req.params.id;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res) => {
    let id = req.params.id;
    const campground = await Campground.findById(id);
    res.render("campgrounds/edit", { campground });
  })
);

// if a random URL that doesn't exist is requested
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// handling asynchronous errors
// whether try-catch is used or catchAsync(), both land here if an error is thrown
app.use((err, req, res, next) => {
  // const { statusCode = 500, message = "something went wrong :(" } = err;
  if (!err.message) err.message = "something went wrong :(";
  res.render("error", { err });
  // res.status(statusCode).send(message);
  // res.send("something went wrong :("); // shown to user
  console.log("called on every call"); // shown here in the terminal (not Chrome)
  console.log(err);
  next(); // needed to call the next window (here, res.send(...))
});

app.listen("3000", () => {
  console.log("Listening on port 3000 :)");
});
