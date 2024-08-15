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

    // Get all products with filtering, sorting, and pagination
    app.get('/allProducts', async (req, res) => {
      try {
        const {
          searchTerm = '',
          brand = '',
          category = '',
          priceRange = '',
          sort = '',
          page = 1,
          limit = 10,
        } = req.query;

        // Build query
        let query = {};
        if (searchTerm) {
          query.name = { $regex: searchTerm, $options: 'i' };
        }
        if (brand) {
          query.brand = brand;
        }
        if (category) {
          query.category = category;
        }
        if (priceRange) {
          if (priceRange === 'low') {
            query.price = { $lt: 50 };
          } else if (priceRange === 'medium') {
            query.price = { $gte: 50, $lte: 100 };
          } else if (priceRange === 'high') {
            query.price = { $gt: 100 };
          }
        }

        // Sort options
        let sortOptions = {};
        if (sort === 'priceLowToHigh') {
          sortOptions.price = 1;
        } else if (sort === 'priceHighToLow') {
          sortOptions.price = -1;
        } else if (sort === 'newest') {
          sortOptions.dateAdded = -1;
        }

        // Pagination
        const pageNumber = parseInt(page, 10);
        const pageLimit = parseInt(limit, 10);
        const skip = (pageNumber - 1) * pageLimit;

        // Get products with filter, sort, and pagination
        const products = await productCollection.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(pageLimit)
          .toArray();

        // Count total products for pagination
        const totalProducts = await productCollection.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / pageLimit);

        res.json({
          products,
          totalPages,
          currentPage: pageNumber,
        });
      } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
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
