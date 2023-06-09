const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

//MongoDB
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.apksail.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const toyCollection = client.db("toyManager").collection("toy");



    //Toy search by Name 
    const indexKeys = { name: 1 };
    const indexOptions = { name: "name" }; 
    const result = await toyCollection.createIndex(indexKeys, indexOptions);

    app.get("/searchToyByName/:text", async (req, res) => {
      const text = req.params.text;
      const result = await toyCollection
        .find({
          $or: [
            { name: { $regex: text, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });

    



    // Insert (Create) a toy to database
    app.post("/upload-toy", async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await toyCollection.insertOne(data);
      res.send(result);
    });

    // Get (Read) a toy from database
    app.get("/all-toys", async (req, res) => {
      const toys = toyCollection.find();
      const result = await toys.toArray();
      res.send(result);
    });

    //Update a toy data using id
    app.patch("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const updateToyData = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          ...updateToyData,
        },
      };
      const result = await toyCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    //Delete a toy data using id
    app.delete("/toy/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await toyCollection.deleteOne(filter);
        res.send(result);
      } catch (err) {
        console.log(err.message);
      }
    });

    //Toy Details
    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const data = await toyCollection.findOne(filter);
      res.send(data);
    });

    //My Toys
    app.get("/myToys/:email", async (req, res) => {
      // console.log(req.params.email);
      const result = await toyCollection
        .find({ seller_email: req.params.email })
        .toArray();
      res.send(result);
    });


    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toy Universe Server is running successfully on port 5000");
});

app.listen(port, () => {
  console.log(`Toy Universe Server is running on port : ${port}`);
});
