const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const mongoose = require('mongoose');
const cors = require("cors")

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 8080;

const Ghgdata = require("./models/Ghgmodel");
const Client = require("./models/Clientdata")
const EmissionData = require('./models/Emission');
const User = require('./models/Userdata');
const News = require('./models/News');


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

// Set up Multer for handling file uploads
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Serve static files from the 'public' folder
app.use(express.static('public'));

// Handle image upload
app.post('/upload', upload.single('image'), (req, res) => {
  const imagePath = `/uploads/${req.file.filename}`;
  res.json({ imagePath });
});

// Fetch all uploaded image paths
app.get('/images', (req, res) => {
  const uploadDir = path.join(__dirname, 'public', 'uploads');
  try {
    const imagePaths = fs.readdirSync(uploadDir).map((file) => `/uploads/${file}`);
    res.json(imagePaths);
  } catch (error) {
    console.error('Error reading image directory:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//////CMS//////

// News Routes


app.get('/news', async (req, res) => {
  try {
    const newsData = await News.find().sort({ createdAt: -1 });
    res.json(newsData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/addnews', upload.single('image'), async (req, res) => {
  const { title, content } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  if (!image) {
    return res.status(400).json({ message: 'Image is required' });
  }

  const newNews = new News({
    title,
    image,
    content,
  });

  try {
    const savedNews = await newNews.save();
    res.status(201).json(savedNews);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// Add Client Data
app.post('/addclient', upload.single('logoimg'), async (req, res) => {
  const { username, userId, password } = req.body;
  const logoimg = req.file ? `/uploads/${req.file.filename}` : null; // Save the path of the uploaded image

  try {
    // Save the data to the database using the Client schema
    const newClient = new Client({ username, userId, password, logoimg });
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

app.post('/adduser', async (req, res) => {
  const { clientId, username, userId, password, emailid } = req.body;

  try {
    // Check if the emailid already exists in the database
    const existingUser = await User.findOne({ emailid });

    if (existingUser) {
      console.log('User with this email already exists!');
      return res.status(400).json({ message: 'User with this email already exists!' });
    }

    // If emailid is unique, save the data to the database using the User schema
    const newUser = new User({ clientId, username, userId, password, emailid });
    await newUser.save();

    console.log('User added successfully!');
    res.status(200).json({ message: 'User added successfully!' });
  } catch (error) {
    console.error('Failed to add User:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


//  Get All User Details
app.get('/allusers', async (req, res) => {
  try {
    // Fetch all clients from the database
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('Failed to get users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Define the route to fetch users based on client ID
app.get('/getusers', async (req, res) => {
  try {
    const { clientId } = req.query;
    // Fetch users based on the provided client ID
    const users = await User.find({ clientId });

    res.status(200).json(users);
  } catch (error) {
    console.error('Failed to get users:', error);
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

// User Login
app.post('/userlogin', async (req, res) => {
  const { userId, password } = req.body;

  try {
    // Check if the client with the provided userId and password exists
    const user = await User.findOne({ userId, password });

    if (user) {
      // Login successful
      res.status(200).json({ message: 'User Login successful' });
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

  const updatedData = await Ghgdata.findByIdAndUpdate(id, newData, { new: true });

    if (!updatedData) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.status(200).json(updatedData);
  try {
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
    const { userId } = req.query;

    const data = await EmissionData.find({ userId });
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
      const { rows, latestImagePath, } = req.body;

        // Get userId from local storage
    const userId = req.headers.authorization || ''; // Assuming userId is sent in the headers

      // Assuming each row in the front-end is one document in the backend
      for (const row of rows) {
        const newEmissionData = new EmissionData({
          userId: userId,
          selectedName: row.selectedName,
          selectedCategory: row.selectedCategory,
          selectedCountry: row.selectedCountry,
          selectedType: row.selectedType,
          selectedBrand: row.selectedBrand,
          description: row.description,
          group: row.group,
          sku: row.sku,
          unit: row.unit, 
          consumption: row.distance, 
          emission: row.emission, 
          date: row.date,
          date1: row.date1,
          distance: row.distance, 
          result: row.result,
          image: row.image,
        });
  
        await newEmissionData.save();
      }
  
      res.status(200).json({ success: true, message: 'Data saved successfully' });
    } catch (error) {
      console.error('Error saving data:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Delete emission data
app.delete('/deleteEmissionData', async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ success: false, message: 'ID is required' });
    }

    const result = await EmissionData.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Data not found' });
    }

    res.status(200).json({ success: true, message: 'Data deleted successfully' });
  } catch (error) {
    console.error('Error deleting data:', error);
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
