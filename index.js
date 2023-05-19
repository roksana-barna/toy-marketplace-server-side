const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lvcap8y.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const database = client.db('toysDB');
    const toysCollection = database.collection('toys')
    app.get('/toys/:text', async (req, res) => {
      console.log(req.params.text);
      if (req.params.text == 'barbie' || req.params.text == 'american girl' || req.params.text == 'baby dolls') {
        const result = await toysCollection.find({ subCategory: req.params.text }).toArray();
        console.log(result);
        return res.send(result);
      }
      const result = await toysCollection.find({}).toArray();
      res.send(result)
    })
    app.post('/toys', async (req, res) => {
      const toy = req.body;
      console.log('new toys', toy)
      const result = await toysCollection.insertOne(toy);
      res.send(result);
    });

    app.get('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const user = await toysCollection.findOne(query)
      res.send(user);
    });
    // Send a ping to confirm a successful connection
    app.get('/toys', async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await toysCollection.find(query).toArray();
      res.send(result);

    })

    // update
    app.get('/update/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.findOne(query);
      res.send(result)
    })
    app.put('/update/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updatedtoy = req.body;
      const toy = {
        $set: {
          price: updatedtoy.price,
          quantity: updatedtoy.quantity,
          description: updatedtoy.description
        }
      }
      const result = await toysCollection.updateOne(filter, toy, options);
      res.send(result)
    })

    // delete
    app.delete('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    })
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('toys is running')
})
app.listen(port, () => {
  console.log('toys is commming')
})