const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const admin = require("firebase-admin");
const ObjectId = require('mongodb').ObjectId;
const dotenv = require('dotenv').config();

const app = express()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const serviceAccount = JSON.parse(process.env.FIREBASE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qbxjg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function verifyToken(req, res, next) {
    if (req.headers?.authorization?.startsWith('Bearer ')) {
        const token = req.headers.authorization.split(' ')[1];

        try {
            const decodedUser = await admin.auth().verifyIdToken(token);
            req.decodedEmail = decodedUser.email;
        }
        catch {

        }

    }
    next();
}

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
        });
        // DELETE API
        app.delete('/deleteServices/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await servicesCollection.deleteOne(query);
            res.json(result);
        });
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
        });

        // ODER DATABASE
        const oderCollection = database.collection("order");
        app.post('/oder', async (req, res) => {
            const newOder = req.body;
            const oderResult = await oderCollection.insertOne(newOder);
            console.log('new oder', oderResult);
            res.json(oderResult);
        });
        //  GET API
        app.get('/oder', async (req, res) => {
            const cursor = oderCollection.find({})
            const oder = await cursor.toArray()
            res.json(oder);
        });
        // EMAIL GET API
        app.get('/oders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const oderCursor = oderCollection.find(query);
            const oderResult = await oderCursor.toArray();
            res.json(oderResult);
        });
        // DELETE API
        app.delete('/oder/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await oderCollection.deleteOne(query);
            res.json(result);
        })
        // ADMIN COLLECTION DATABASE
        const adminCollection = database.collection("admin");
        app.post('/makeAdmin', async (req, res) => {
            const newAdmin = req.body;
            const adminResult = await adminCollection.insertOne(newAdmin);
            // console.log('new admin', adminResult);
            res.json(adminResult);
        });
        // USER COLLECTION
        const usersCollection = database.collection("user");
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.put('/users/admin', verifyToken, async (req, res) => {
            const user = req.body;
            const requester = req.decodedEmail;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount.role === 'admin') {
                    const filter = { email: user.email };
                    const updateDoc = { $set: { role: 'admin' } };
                    const result = await usersCollection.updateOne(filter, updateDoc);
                    res.json(result);
                }
            } else {
                res.status(403).json({ message: 'do you not have access make admin' })
            }

        });
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
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
});