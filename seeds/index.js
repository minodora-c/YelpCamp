// run this file separately when to seed the DB

const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");
const axios = require("axios").default;

// use 127.0.0.1 instead of localhost!
mongoose.connect("mongodb://127.0.0.1:27017/Yelp");

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  const promises = [];
  let campNum = 30;

  // separate out the image request to improve speediness of app
  for (let i = 0; i < campNum; i++) {
    const imagePromise = axios
      .get("https://source.unsplash.com/collection/483251")
      .then((response) => response.request.res.responseUrl);
    promises.push(imagePromise);
  }
  const images = await Promise.all(promises);

  for (let i = 0; i < campNum; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: images[i],
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
      price,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
