const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4dm99p5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const productCollection = client.db('JobTask').collection('products');


    // getting al the products
    app.get('/allProducts', async (req, res) => {
        const page = parseInt(req.query.page) || 1; // Get the current page from the query, default to 1
        const limit = parseInt(req.query.limit) || 10; // Set the number of products per page, default to 10
    
        const skip = (page - 1) * limit; // Calculate the number of documents to skip
    
        const totalProducts = await productCollection.countDocuments(); // Get the total number of products
        const products = await productCollection.find().skip(skip).limit(limit).toArray(); // Fetch the products
    
        res.send({
            totalProducts,
            products,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page,
        });
    });
    


   



    app.get('/', (req, res) => {
      res.send("Job task is running");
    });

    app.listen(port, () => {
      console.log(`Job task is running on port ${port}`);
    });

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);
