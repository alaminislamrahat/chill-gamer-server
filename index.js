require('dotenv').config();

const express = require('express');
const cors = require('cors');



const port = process.env.PORT || 5000;

const app = express();


// middle ware 
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3jkraio.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Send a ping to confirm a successful connection


    const reviewsCollection = client.db('chillGamer').collection('reviews');
    const watchlistCollection = client.db('chillGamer').collection('watchlist');


    // watchlist 
    app.post('/watchlist', async (req, res) => {
      const data = req.body;
      const result = await watchlistCollection.insertOne(data);
      res.send(result);
    })


    app.get('/watchlist', async (req, res) => {
      const email = req.query.email;
      console.log(email)
      const result = await watchlistCollection.find({ userEmail: email }).toArray();
      res.send(result);
    })


    app.get('/myReviews', async (req, res) => {
      const email = req.query.email;

      //  console.log(email)
      const result = await reviewsCollection.find({ userEmail: email }).sort({ rating: -1 }).toArray();
      res.send(result);
    })

    app.get('/reviews', async (req, res) => {
      const genre = req.query.genre;
      const toggleSort = req.query.toggleSort
      let options = {};
      if (toggleSort == 'year') {
        options = { sort: { publishingYear: -1 } }
      }
      else {
        options = { sort: { rating: -1 } }
      }
      let filter = {}
      if (genre) {
        filter = { genre: genre }
      }
      const result = await reviewsCollection.find(filter, options).toArray();
      res.send(result);
    })

    app.post('/addReviws', async (req, res) => {
      const reviews = req.body;
      const result = await reviewsCollection.insertOne(reviews);
      res.send(result)

    })


    app.get('/review/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await reviewsCollection.findOne(query);
      res.send(result);
    });


    app.delete('/myReview/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await reviewsCollection.deleteOne(query);
      res.send(result);
    });


    app.put('/review/:id', async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...data
        }
      }
      const result = await reviewsCollection.updateOne(filter, updateDoc, options);
      res.send(result);

    })


    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello from chill gamer server ....')
})
app.listen(port, () => console.log(`server running on port : ${port}`))