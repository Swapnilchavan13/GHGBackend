const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const mongoose = require('mongoose');
const cors = require("cors")

const app = express();
const port = 8080;

const Ghgdata = require("./models/Ghgmodel");
const Client = require("./models/Clientdata")
const EmissionData = require('./models/Emission');


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


// Add Client Data
app.post('/addclient', async (req, res) => {
  const { username, userId, password } = req.body;

  try {
    // Save the data to the database using the Client schema
    const newClient = new Client({ username, userId, password });
    await newClient.save();

    console.log('Client added successfully!');
    res.status(200).json({ message: 'Client added successfully!' });
  } catch (error) {
    console.error('Failed to add client:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//Get client Details
app.get('/getclients', async (req, res) => {
  try {
    // Fetch all clients from the database
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (error) {
    console.error('Failed to get clients:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Client Login
app.post('/login', async (req, res) => {
  const { userId, password } = req.body;

  try {
    // Check if the client with the provided userId and password exists
    const client = await Client.findOne({ userId, password });

    if (client) {
      // Login successful
      res.status(200).json({ message: 'Login successful' });
    } else {
      // Login failed
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update data by ID
app.put('/updateData/:id', async (req, res) => {
  const { id } = req.params;
  const newData = req.body;

  try {
    const updatedData = await Ghgdata.findByIdAndUpdate(id, newData, { new: true });

    if (!updatedData) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.status(200).json(updatedData);
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

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

// Fetch data from MongoDB and send it to the client
app.get('/getdata12', async (req, res) => {
  try {
    const data = await EmissionData.find();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
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


  // Save emission data
  app.post('/savedata', async (req, res) => {
    try {
      const { rows } = req.body;
  
      // Assuming each row in the front-end is one document in the backend
      for (const row of rows) {
        const newEmissionData = new EmissionData({
          Name: row.selectedName,
          Category: row.selectedCategory,
          Country: row.selectedCountry,
          Type: row.selectedType,
          Brand: row.selectedBrand,
          Description: row.description, // Assuming you have a 'description' field in your data
          Group: row.group, // Assuming you have a 'group' field in your data
          SKU: row.sku, // Assuming you have an 'sku' field in your data
          Unit: row.unit, // Assuming you have a 'unit' field in your data
          Consumption: row.consumption, // Assuming you have a 'consumption' field in your data
          Emission: row.emission, // Assuming you have an 'emission' field in your data
        });
  
        await newEmissionData.save();
      }
  
      res.status(200).json({ success: true, message: 'Data saved successfully' });
    } catch (error) {
      console.error('Error saving data:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
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
