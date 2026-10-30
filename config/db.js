const mongoose = require("mongoose");
require("dotenv").config();

const connect = () => {
  const MongoURL = process.env.MONGO_URI;
  const DB = process.env.DB;

  mongoose
    .connect(`${MongoURL}/${DB}`, {})
    // mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🚀 DataBase Connected"))
    .catch((reason) => {
      console.log(`💩 Unable to connect to DataBase \n${reason}`);
    });
};

module.exports = { connect };
