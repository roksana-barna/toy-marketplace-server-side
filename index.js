const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
// middleware
app.use(cors(corsOptions))
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
    

    const database = client.db('toysDB');
    const toysCollection = database.collection('toys')
    app.get('/single/toys/:text', async (req, res) => {
      console.log(req.params.text);
      if (req.params.text == 'barbie' || req.params.text == 'american girl' || req.params.text == 'baby dolls') {
        const result = await toysCollection.find({ subCategory: req.params.text }).limit(2).toArray();
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
      const toy = await toysCollection.findOne(query)
      res.send(toy);
    });
    // toys
    app.get('/toys',async(req,res)=>{
      const cursor=toysCollection.find()
      const result=await cursor.toArray();
      res.send(result);
    })
    // Send a ping to confirm a successful connection
    // app.get('/toys/:sortBy/:email', async (req, res) => {
    //   const email = req.params.email;
    //   const sortBy = req.params.sortBy;
    //   console.log(sortBy);
    //   // let sort = { price: -1 };
    //   // if (sortByPrice !== 0) {
    //   //    const sort = { price: sortByPrice };
    //   // }
    //   let query = {};
    //   if (email) {
    //     query = { email: email }
    //   }
    //   const sort = { price: sortByPrice };
    //   const result = await toysCollection.find(query).sort(sort).limit(20).toArray();
    //   res.send(result);

    // })
    // sort
    app.get('/toys/:email/:sortByPrice', async (req, res) => {
      const email = req.params.email;
      const sortByPrice = req.params.sortByPrice;
      const query = {email : email};
       const sort = { price:sortByPrice};
       console.log(email)
       console.log(sortByPrice)
      

      const cursor =  toysCollection.find(query).sort(sort).collation({locale: "en_US", numericOrdering: true}).limit(20);
      const result = await cursor.toArray();
      return res.send(result);
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
    // 

    // view details
    app.get('/viewdetails/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.findOne(query);
      res.send(result)
    })
    // searching
    const indexKeys = { name: 1 };
    const indexOptions = { name: 'toyName' };
    const result = await toysCollection.createIndex(indexKeys, indexOptions);
    console.log(result);

    app.get("/toyNameSearch/:text", async (req, res) => {
      const text = req.params.text;
      // console.log(text)
      const result = await toysCollection
        .find({
          $or: [
            { name: { $regex: text, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });
    // 


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