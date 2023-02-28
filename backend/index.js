const express = require("express"); // Includes express into backend
const app = express(); // Variable of app to use express method
const cors = require("cors"); // Bring in CORS
const bodyParser = require("body-parser"); // Include BodyParser
const mongoose = require("mongoose"); // Import Mongoose
const bcrypt = require("bcryptjs");
const config = require("./config.json"); // Get config
const Product = require("./models/product");
const User = require("./models/user");


const port = 8080; // Set the port number for our local server

// This is what starts off the server at Port : 8080
app.use((req, res, next) => {
    console.log(`${req.method} request ${req.url}`);
    next();
})

app.use(bodyParser.json()); // Calling Body Parser method
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(cors()); // Calling CORS method with express

app.get("/", (req, res) => res.send("Hello from the backend")) // "/" Full URL would be http://localhost:1988 Sent to backend on req

// Set up Mongoose Connection to MongoDB
mongoose.connect(`mongodb+srv://${config.MONGO_USER}:${config.MONGO_PASSWORD}@cluster0.${config.MONGO_CLUSTER_NAME}.mongodb.net/${config.MONGO_DBNAME}?retryWrites=true&w=majority`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => console.log("DB Connected"))
    .catch(err => {
        console.log(`DB Connection Error: ${err.message}`);
    })

app.listen(port, () => console.log(`My full stack application is listening on port ${port}`)) // Sent to Nodemon - Checking server

// --------- PRODUCT END POINTS --------- 

// Get all products from the Database
app.get("/allProductsFromDB", (req, res) => {
    Product.find().then(result => {
        res.send(result)
    })
})


// Get Single Product
app.get('/singleProduct/:id', (req,res) => {
    const idParam = req.params.id;
    Product.findById(idParam).then(result => {
        res.send(result)
    });
});

// Post method to CREATE a product
app.post("/addProduct", (req, res) => {
    const dbProduct = new Product({
        _id: new mongoose.Types.ObjectId,
        name: req.body.name,
        price: req.body.price,
        image_url: req.body.image_url,
        user_id: req.body.user_id,
    });
    dbProduct.save().then(result => {
        res.send(result);
    }).catch(err => res.send(err))
})


// Edit or UPDATE - using "Patch"

app.patch("/updateProduct/:id", (req, res) => {
    const idParam = req.params.id;
    Product.findById(idParam, (err, product) => {
        const updatedProduct = {
            name: req.body.name,
            price: req.body.price,
            image_url: req.body.image_url,
        }
        Product.updateOne({
                _id: idParam
            }, updatedProduct)
            .then(result => {
                res.send(result);
            }).catch(err => res.send(err))
    })
})

// Delete Product
app.delete("/deleteProduct/:id", (req, res) => {
    const idParam = req.params.id;
    Product.findOne({
        _id: idParam
    }, (err, product) => {
        if (product) {
            Product.deleteOne({
                _id: idParam
            }, err => {
                console.log("Deleted on backend request");
            });
        } else {
            alert("Not found");
        }
    }).catch(err => res.send(err));
}) // End of Delete

// ------------- USER ENDPOINT ------------- //

// Register User
app.post("/registerUser", (req, res) => {
    User.findOne({
        username: req.body.username,
    }, (err, userExists) => {
        if (userExists) {
            res.send("username already taken");
        } else {
            const hash = bcrypt.hashSync(req.body.password);
            const user = new User({
                _id: new mongoose.Types.ObjectId,
                username: req.body.username,
                password: hash,
                email: req.body.email
            });
            user.save()
                .then(result => {
                    console.log(user, result);
                    res.send(result);
                }).catch(err => {
                    res.send(err)
                });

        } // End of else

    }) // End of FindOne

}) // End of Register

// Login User
app.post("/loginUser", (req, res) => {
    User.findOne({
        username: req.body.username
    }, (err , userResult) => {
        if (userResult) {
            if (bcrypt.compareSync(req.body.password, userResult.password)) {
                res.send(userResult);
            } else {
                res.send("Not authorised");
            } // End of inner if else
        } else {
            res.send("User not found. Please register.")
        } // End of outer if else

    }) // End of FindOne

}) // End of Post for Login