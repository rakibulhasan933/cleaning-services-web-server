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
        // DATABASE COLLECTION PART
        const database = client.db("cleaning");
        const Services = database.collection("services");
        console.log('Database connected');

        // const result = await haiku.insertOne(doc);
        // console.log(`A document was inserted with the _id: ${result.insertedId}`);
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