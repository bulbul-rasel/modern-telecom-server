const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

//middleware
app.use(cors());
app.use(express.json());

const validateId = (req, res, next) => {
    const id = req.params.id;
    const objectIdRegex = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;
    const validId = objectIdRegex.test(id);

    if (!id || !validId) {
        return res.send({ success: false, error: 'Invalid id' });
    }

    req.id = id;

    next();
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cqtkf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
        await client.connect();
        const productCollection = client.db('modernTelecom').collection('product');


        // POST
        app.post('/products', async (req, res) => {
            const product = req.body;

            if (!product.name || !product.email || !product.image || !product.description || !product.price || !product.quantity || !product.sname) {
                return res.send({ success: false, error: "Please Provide all Information" })
            }

            const result = await productCollection.insertOne(product);
            res.send({ success: true, message: `Successfully inserted ${product.name}` })
        })

        // Get

        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        //myorder get api

        app.get('/myitem', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = productCollection.find(query);
            const myItem = await cursor.toArray();
            res.send(myItem);
        })

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        })

        // delete
        app.delete("/products/:id", validateId, async (req, res) => {
            const id = req.id;


            const result = await productCollection.deleteOne({ _id: ObjectId(id) })

            console.log(result)

            if (!result.deletedCount) {
                return res.send({ success: false, error: "something went wrong" });
            }

            res.send({ success: true, message: "Successfully deleted " })

        });
    }
    catch (error) {
        console.log(error);
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running server');
});

app.listen(port, () => {
    console.log('Listening to port', port);
});