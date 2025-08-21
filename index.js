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

const Isnregistration = require("./models/Registration"); // Correct path to the model
const Ghgdata = require("./models/Ghgmodel");
const Client = require("./models/Clientdata")
const EmissionData = require('./models/Emission');
const User = require('./models/Userdata');
const News = require('./models/News');
const Product = require("./models/Product");


const Admin = require("./models/Admin")
const EmissionEntry = require('./models/EmissionEntry'); // import schema
const Business = require("./models/Business");

const Project = require("./models/Project")



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


// ISN Registration Routes

// POST request to save registration data
app.post('/isn-registration', async (req, res) => {
  try {
    const registrationData = new Isnregistration(req.body);
    await registrationData.save();
    res.status(201).json({ message: 'Registration successful', data: registrationData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET request to fetch all registration data
app.get('/getisn-registration', async (req, res) => {
  try {
    const registrations = await Isnregistration.find();
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

// Fetch a news article by ID
app.get('/news/:id', async (req, res) => {
  try {
    const newsId = req.params.id;
    const newsArticle = await News.findById(newsId);
    if (!newsArticle) {
      return res.status(404).json({ message: 'News article not found' });
    }
    res.json(newsArticle);
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


// Handle product addition with multiple images
app.post('/addproduct', upload.array('images', 3), async (req, res) => {
  const { name, price, description, rating, category, quantity } = req.body;
  const images = req.files.map(file => `/uploads/${file.filename}`); // Extract image paths

  if (images.length === 0) {
    return res.status(400).json({ message: 'At least one image is required' });
  }

  try {
    const newProduct = new Product({
      name,
      images,
      price,
      description,
      rating,
      category,
      quantity
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get a product by ID
app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update a product by ID
app.put('/products/:id', upload.array('images', 3), async (req, res) => {
  const { name, price, description, rating, category, quantity } = req.body;
  const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : undefined;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
      name,
      images: images || undefined,
      price,
      description,
      rating,
      category,
      quantity
    }, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete a product by ID
app.delete('/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Optionally delete images from the file system
    const uploadDir = path.join(__dirname, 'public', 'uploads');
    deletedProduct.images.forEach(image => {
      const imagePath = path.join(uploadDir, path.basename(image));
      fs.unlink(imagePath, err => {
        if (err) console.error(`Failed to delete image: ${imagePath}`);
      });
    });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
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
          mainCategory: row.mainCategory, // Include the mainCategory field here
        });
  
        await newEmissionData.save();
      }
  
      res.status(200).json({ success: true, message: 'Data saved successfully' });
    } catch (error) {
      console.error('Error saving data:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Edit emission data
  app.put('/editEmissionData', async (req, res) => {
    try {
      const { id, updatedData } = req.body;
  
      if (!id || !updatedData || !updatedData.distance) {
        return res.status(400).json({ success: false, message: 'ID and distance are required' });
      }
  
      // Find the current data by ID
      const currentData = await EmissionData.findById(id);
  
      if (!currentData) {
        return res.status(404).json({ success: false, message: 'Data not found' });
      }
  
      // Calculate the emission value based on the result and current distance
      const currentResult = parseFloat(currentData.result);
      const currentDistance = parseFloat(currentData.distance);
  
      // Calculate the emission per distance unit
      const emissionPerUnit = currentResult / currentDistance;
  
      // Calculate the new result based on the updated distance
      const newDistance = parseFloat(updatedData.distance);
      const newResult = emissionPerUnit * newDistance;
  
      // Update the updatedData object with the new result and distance
      updatedData.result = newResult;
      updatedData.distance = newDistance;
  
      // Update the data in the database
      const updatedEmissionData = await EmissionData.findByIdAndUpdate(id, updatedData, { new: true });
  
      res.status(200).json({ success: true, message: 'Data updated successfully', data: updatedEmissionData });
    } catch (error) {
      console.error('Error updating data:', error);
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


//ECOM APIS

// Admin Register
 
app.post("/admin/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // check if admin exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const newAdmin = new Admin({ username, password, businesses: [] });
    await newAdmin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ================== ADMIN ==================

// Admin Register
app.post('/admin/register', async (req, res) => {
    const { username, password } = req.body;
    const exists = await Admin.findOne({ username });
    if (exists) return res.status(400).json({ message: "Admin already exists" });

    const admin = new Admin({ username, password });
    await admin.save();
    res.json({ message: "Admin registered successfully", admin });
});

// Admin Login
app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username, password });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ message: "Login successful", adminId: admin._id });
});


// ================== BUSINESS ==================

// Create Business (by Admin)
app.post('/business/create', async (req, res) => {
    const { adminId, name, username, password } = req.body;

    const exists = await Business.findOne({ username });
    if (exists) return res.status(400).json({ message: "Business username already exists" });

    const business = new Business({ adminId, name, username, password });
    await business.save();
    res.json({ message: "Business created successfully", business });
});

// Business Login
app.post('/business/login', async (req, res) => {
    const {username, password } = req.body;
    const business = await Business.findOne({ username, password });
    if (!business) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ message: "Login successful",adminId: business.adminId, businessId: business._id, businessName: business.username });
});


// ================== EMISSIONS ==================

// Add Emission (by Business)
app.post('/emission/add', async (req, res) => {
    const { businessId, emissionType, amount } = req.body;
    const emission = new EmissionEntry({ businessId, emissionType, amount });
    await emission.save();
    res.json({ message: "Emission added successfully", emission });
});

// Get emissions by username
app.get('/emission/:username', async (req, res) => {
    const { username } = req.params;  // Changed from userName to username
    const emissions = await EmissionEntry.find({ username });  // Changed from userName to username
    res.json(emissions);
});

// Get emissions by username
app.get('/admin/emission/:adminId', async (req, res) => {
    const { adminId } = req.params;  // Changed from userName to username
    const emissions = await EmissionEntry.find({ adminId });  // Changed from userName to username
    res.json(emissions);
});

// Get All Emissions for Admin (using businessId)
app.get('/admin/emissions/:adminId', async (req, res) => {
    try {
        const { adminId } = req.params;
        
        // Get all businesses under this admin
        const businesses = await Business.find({ adminId });
        
        // Extract business IDs
        const businessIds = businesses.map(b => b._id.toString());
        
        // Find emissions by businessId
        const emissions = await EmissionEntry.find({ 
            businessId: { $in: businessIds } 
        });
        
        res.json(emissions);
    } catch (error) {
        console.error("Error fetching admin emissions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// To get businesses by adminId
app.post('/businesses/by-admin', async (req, res) => {
  const { adminId } = req.body;
  if (!adminId) return res.status(400).json({ message: 'adminId required' });
  const businesses = await Business.find({ adminId });
  res.json({ businesses });
});




app.post('/emissions', async (req, res) => {
  try {
    const data = req.body;

    // Validate required fields (example)
    if (!data.username || !data.transactionType) {
      return res.status(400).json({ error: 'username and transactionType are required' });
    }

    const newEntry = new EmissionEntry(data);
    await newEntry.save();

    res.status(201).json({ message: 'Entry saved successfully', entry: newEntry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.get("/admin/emissions/:adminId", async (req, res) => {
  const { adminId } = req.params;

  try {
    // Find all businesses for this admin
    const businesses = await Business.find({ adminId }).select("_id");

    const businessIds = businesses.map((b) => b._id);

    // Find all emissions for those businesses
    const emissions = await EmissionEntry.find({ businessId: { $in: businessIds } });

    res.json(emissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get('/ecomemissions', async (req, res) => {
  try {
    const entries = await EmissionEntry.find(); // fetch all entries
    res.status(200).json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// POST → Add new project
app.post("/addprojects", async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET → Fetch all projects
app.get("/getprojects", async (req, res) => {
  try {
    const projects = await Project.find().sort({ enteredTime: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
