const express = require("express");
const cors = require("cors");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 6000;
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
    client.connect();
    const allToysCollection = client.db("marvelToy").collection("toys");
    const catagoriesCollection = client.db("catagory").collection("catagorys");
    // catagory\
    app.get("/catagories", async (req, res) => {
      const result = await catagoriesCollection.find().toArray();

      res.send(result);
    });
    app.get("/catagories/:id", async (req, res) => {
      console.log(req.params.id);
      const query = {
        _id: new ObjectId(req.params.id),
      };
      const result = await catagoriesCollection.findOne(query);
      res.send(result);
    });
    app.get("/allToys", async (req, res) => {
      // console.log(req.query.sellerEmail);
      const type = req.query.type === "ascending";
      const value = req.query.value;
      const sortObj = {};
      sortObj[value] = type ? 1 : -1;
      let query = {};
      console.log(query);
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const curser = allToysCollection.find(query).sort(sortObj).limit(20);
      const result = await curser.toArray();

      res.send(result);
    });
    app.get("/toysearch/:text", async (req, res) => {
      // console.log(req.query.sellerEmail);
      const text = req.params.text;
      const result = await allToysCollection
        .find({
          $or: [{ name: { $regex: text, $options: "i" } }],
        })
        .toArray();

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
          quantity: body.quantity,
          price: body.price,
          img: body.img,
          name: body.name,
          category: body.category,
          rating: body.rating,
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
