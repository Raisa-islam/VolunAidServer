const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5001;

//middlewares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u1k19dw.mongodb.net/?retryWrites=true&w=majority`;

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
   
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const database = client.db("b9a11");
    const collection = database.collection("volunteerPost");
    const collection2 = database.collection("applyPost")
    
    app.get('/addVolPost/:val', async (req, res) => {
      const x = req.params.val;
      var query;
      if (x === 'All') {

        const cursor = collection.find();
        const result = await cursor.toArray();
        res.send(result);

      }
      else {
        query = { title: x }
        const cursor = collection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      }

    })

    app.get('/addVolPost/All/:id', async (req, res) => {
      const id = req.params.id;
      const objectId = new ObjectId(id)
      const result = await collection.findOne({ _id: objectId });
      res.send(result)
    })

    app.get('/myPosts/:email', async (req, res) => {
      const x = req.params.email;
      var query = { email: x }
      const cursor = collection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })


    app.get('/applyPosts/:email', async (req, res) => {
      const x = req.params.email;
      var query = { vemail: x }
      const cursor = collection2.find(query);
      const result = await cursor.toArray()
      res.send(result)
    })
    
    app.post('/addVolPost/All', async (req, res) => {
      const item = req.body;
      console.log('new item', item);
      const result = await collection.insertOne(item);
      res.send(result);
    })

    app.post('/applyPosts', async (req, res) => {
      const item = req.body;
      //console.log('new item', item);
      const result = await collection2.insertOne(item);
      res.send(result);
    })

    app.put('/incrementField/:id', async(req, res)=>{
      const id = req.params.id;
      const item =req.body;
      console.log(item);

      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true}
      const updatedItem = {
        $set: {
          thumbnail:item.thumbnail, 
          title:item.title,
          category:item.category, 
          description:item.description, 
          name:item.name, 
          email:item.email, 
          location:item.location,
          noOfVol:item.noOf , 
          selectedDate:item.selectedDate
        }
      }

      const result = await collection.updateOne(filter, updatedItem, options)
      res.send(result);
      
    })

    app.delete('/post/:id', async(req, res)=>{
      const id = req.params.id;
      console.log("going to delete the ", id);
      const objectId = new ObjectId(id);

      const query = {_id:objectId}
      const result = await collection2.deleteOne(query);
      res.send(result);
    })

    app.delete('/allVolPost/:id', async(req, res)=>{
      const id = req.params.id;
      console.log("going to delete the ", id);
      const objectId = new ObjectId(id);

      const query = {_id:objectId}
      const result = await collection.deleteOne(query);
      res.send(result);
    })


    
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('here i am')
})
app.listen(port, () => {
  console.log(`server is running on ${port}`)
})
