const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const dotenv = require('dotenv').config();


const app = express()
const port = `${process.env.PORT}`;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qbxjg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const database = client.db("cleaning");


        // SERVICES DATABASE COLLECTION PART
        const servicesCollection = database.collection("services");
        console.log('Database connected');

        //  POST API
        app.post('/services', async (req, res) => {
            const newServices = req.body;
            const result = await servicesCollection.insertOne(newServices);
            res.json(result);

        })
        // GET API ALL
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        })
        // GET API ID
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await servicesCollection.findOne(query);
            res.json(result);
        })

        // REVIEW DATABASE COLLECTION PART
        const reviewsCollection = database.collection("reviews");

        //  POST API
        app.post('/reviews', async (req, res) => {
            const newReview = req.body;
            const result = await reviewsCollection.insertOne(newReview);
            console.log(result, 'new review added');
            res.json(result);
        })
        // GET API 
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        })


    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Cleaning Services API Working!')
})

app.listen(port, () => {
    console.log(`Cleaning Port listening on port ${port}`)
})