const express = require("express");
const cors = require("cors");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dxmnpk6.mongodb.net/?retryWrites=true&w=majority`;

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
    const allToysCollection = client.db("marvelToy").collection("toys");
    app.get("/allToys", async (req, res) => {
      console.log(req.query.sellerEmail);
      let query = {};
      if (req.query?.sellerEmail) {
        query = { sellerEmail: req.query.sellerEmail };
      }
      const result = await allToysCollection.find(query).toArray();

      res.send(result);
    });
    app.get("/allToys/:id", async (req, res) => {
      console.log(req.params.id);
      const query = {
        _id: new ObjectId(req.params.id),
      };
      const result = await allToysCollection.findOne(query);
      res.send(result);
    });

    app.post("/allToys", async (req, res) => {
      const toys = req.body;
      const result = await allToysCollection.insertOne(toys);
      res.send(result);
    });
    app.patch("/allToys/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      console.log(body);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          Price: body.Price,
          Quantity: body.Quantity,
          description: body.description,
        },
      };
      const result = await allToysCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/allToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allToysCollection.deleteOne(query);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("toys connect");
});
app.listen(port, () => {
  console.log(`Toy server is running on port ${port}`);
});
