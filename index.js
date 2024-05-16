const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5001;

//middlewares
app.use(cors({
  origin:[
    'http://localhost:5173'
  ],
  credentials:true
}));
app.use(express.json());
app.use(cookieParser())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u1k19dw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const logger = (req, res, next)=>{
  //console.log('log:info', req.method, req.url);
  next()
}

const verifyToken = (req, res, next)=>{
  const token = req?.cookies?.token;
 // console.log('token in middleware', token)
  if(!token){
    return res.status(401).send({message: 'unauthorized access'})
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
    if(err){
      return res.status(401).send({message: 'unauthorized access'})
    }
    req.user = decoded;
    console.log(req.user)
    next();
  })
  //next()
}


async function run() {
  try {
   
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const database = client.db("b9a11");
    const collection = database.collection("volunteerPost");
    const collection2 = database.collection("applyPost")

    // auth related api
    app.post('/jwt', async (req, res)=>{
      const user = req.body;
      console.log('user', user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn:'1h'})
      res.cookie('token vol management', token,{
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      })
      .send({success:true})
    })

    app.post('/logout', async(req, res)=>{
      const user = req.body;
      console.log('logging out', user)
      res.clearCookie('token vol management', {maxAge:0})
      .send({success:true})
    })
    
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

    app.get('/myPosts/:email',logger, verifyToken, async (req, res) => {
      const x = req.params.email;
      if(req.user.email !== x){
        return res.status(403).send({message: 'Forbidden Access'})
      }
      var query = { email: x }
      const cursor = collection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })


    app.get('/applyPosts/:email', logger, verifyToken, async (req, res) => {
      const x = req.params.email;
      if(req.user.email !== x){
        return res.status(403).send({message: 'Forbidden Access'})
      }
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
