const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const mongoose = require('mongoose');
const cors = require("cors")

const app = express();
const port = 8080;

const Ghgdata = require("./models/Ghgmodel");

// MongoDB Connection
mongoose.set("strictQuery", false);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors({ origin: "*" }));


// Get all data
app.get("/getdata", async (req, res) => {
  try {
    const allData = await Ghgdata.find();
    res.json(allData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
// POST request to add data dynamically
app.post("/addData", async (req, res) => {
    try {
        const newData = new Ghgdata({
            ...req.body,
            dynamicFields: req.body.dynamicFields || {}, // Ensure dynamicFields is an object
        });

        const savedData = await newData.save();
        res.json(savedData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Delete request to remove a specific data entry
app.delete("/deleteData/:id", async (req, res) => {
    try {
      const deletedData = await Ghgdata.findByIdAndDelete(req.params.id);
      if (deletedData) {
        res.json({ message: "Data successfully deleted", deletedData });
      } else {
        res.status(404).json({ error: "Data not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

// Simple get request
app.get("/", (req, res) => {
    res.send("Hello GHG data");
});

// Start the Server
connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
});
