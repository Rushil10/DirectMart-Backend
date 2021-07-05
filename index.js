const express = require('express');
require('dotenv').config();
const multer = require('multer');
const cors = require('cors');
var mysql = require('mysql');
const { signup, login, updateOwner } = require('./handlers/owner');
const shopAuth = require('./util/shopAuth');
const {notification, sendCustomNotification} = require('./handlers/notification');
const {getShopProducts, addProduct, updateProduct, deleteProduct, getOrders, updateDeliveryStatus, updatePaymentStatus, getCurrentOrders, getOrderDetails, updateDeliveryStatusToOFD, updateDeliveryStatusToD, updateDeliveryStatusToP, getDeliveredProducts, getOutForDeliveryProducts } = require('./handlers/shop_product');
const {consumerSignup, consumerLogin, getShops, getProducts, addToCart, makeOrder, getPreviousOrders, getPreviousOrderDetails, addtocart, deleteFromCart, getPendingOrders, getOutForDeliveryOrders, getDeliveredOrders, subtractFromcart, getCartItems, improveMakeOrder, makeOrder2, checkAvalibilty, makeOrderCod, getShopDetails, addAddress, getAllMyAddress, updateAddressId, createConsumerTokenForChange , makeOrderAtShop, loadAllProducts, getCartItemsOfAShop, storeFcmToken, getSingleProductDetails} = require('./handlers/consumer');
const consumerAuth = require('./util/consumerAuth');
const AWS = require('aws-sdk');
const {v4: uuidv4} = require('uuid');
// const productQuantityAuth = require('./util/productQuantityAuth');

const app = express();
app.use(cors())
app.use(express.json())

const connection = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USERNAME,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE,
    charset:'utf8mb4'
})

connection.connect(err => {
    if(err) {
        throw err
    } else {
        console.log('Connected to database')
    }
})

var port = process.env.PORT || 3000

app.listen(port,() => {
    console.log(`Listening on Port ${port}`);
})

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET
})

const storage = multer.memoryStorage({
    destination: function(req,file,callback) {
        callback(null, '')
    }
})

const upload = multer({storage}).single('image')

app.post('/upload',upload,(req,res) => {

    let myFile = req.file.originalname.split(".")
    const fileType = myFile[myFile.length - 1]

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key:`${uuidv4()}.${fileType}`,
        Body:req.file.buffer
    }

    s3.upload(params,(error , data) => {
        if(error){
            res.status(500).send(error)
        }
        res.status(200).send(data)
    })
})
//Shop

app.post('/shop/signup',signup); //SignUp of shop Owner
app.post('/shop/login',login); //Login Of Shop Owner
app.post('/shop/product',shopAuth,addProduct) //Add One Product Shop Owner
app.post('/shop/product/:product_id',shopAuth,updateProduct) //Update Specific Product Shop Owner
app.delete('/shop/product/:product_id',shopAuth,deleteProduct) //Delete A Product (Needs Work)
app.get('/shop/orders',shopAuth,getCurrentOrders) //Get Current Orders On That Shop (Not Delivered)
app.get('/shop/orders/:order_cart_id',shopAuth,getOrderDetails) //Details of Products in an order
app.get('/shop/products',shopAuth,getShopProducts) //Fetch all the products of a shop
app.post('/order/:order_cart_id',shopAuth,updateDeliveryStatus) // Update DeliveryStatus
app.get('/order/payment/:order_cart_id',shopAuth,updatePaymentStatus) //Update Payment Status
app.get('/orders/delivered',shopAuth,getDeliveredProducts) // Get Delivered Products
app.get('/orders/outForDelivery',shopAuth,getOutForDeliveryProducts)//Out For Delivery
app.post('/shop/fcmtoken',shopAuth,storeFcmToken)
app.post('/shop/update',shopAuth,updateOwner)
//Consumer
app.post('/consumer/address',consumerAuth,addAddress)
app.get('/consumer/address',consumerAuth,getAllMyAddress)
app.get('/consumer/address/update/:address_id',consumerAuth,updateAddressId)
app.post('/consumer/signup',consumerSignup) //Signup Consumer
app.post('/consumer/login',consumerLogin)
app.post('/consumer/shops',consumerAuth,getShops)
app.get('/consumer/:shop_id/products',consumerAuth,getProducts)//getProducts of a shop
//app.post('/consumer/cart/:product_id',consumerAuth,addToCart)
app.post('/consumer/makeOrder',consumerAuth,makeOrder2)
app.post('/consumer/makeOrderCod',consumerAuth,makeOrderCod)
app.get('/consumer/checkAvalibility',consumerAuth,checkAvalibilty)
app.get('/consumer/pending',consumerAuth,getPendingOrders);//get ordered orders
app.get('/consumer/outForDelivery',consumerAuth,getOutForDeliveryOrders);//out for delivery orders
app.get('/consumer/delivered',consumerAuth,getDeliveredOrders);//delivered orders
app.get('/consumer/getPreviousOrder',consumerAuth,getPreviousOrders)
app.get('/consumer/orders/:order_cart_id',consumerAuth,getPreviousOrderDetails)
app.get('/consumer/cart/:product_id',consumerAuth,addtocart)
app.get('/consumer/cart/remove/:product_id',consumerAuth,subtractFromcart);
app.delete('/consumer/cart/:product_id',consumerAuth,deleteFromCart)
app.get('/consumer/cartItems',consumerAuth,getCartItems)
app.get('/consumer/shopDetails/:shop_id',consumerAuth,getShopDetails)
app.post('/consumer/changeAddress',consumerAuth,createConsumerTokenForChange)
app.post('/consumer/orderFromShop',consumerAuth,makeOrderAtShop)
app.get('/consumer/allProducts',consumerAuth,loadAllProducts)
app.get('/consumer/cartItemsOfShop/:shop_id',consumerAuth,getCartItemsOfAShop)

//Notification 

app.post('/notification',notification) 
app.get('/consumer/cartItemsOfShop/:shop_id',consumerAuth,getCartItemsOfAShop)
app.post('/consumer/fcmtoken',consumerAuth,storeFcmToken)
app.get('/consumer/product/:product_id',consumerAuth,getSingleProductDetails)


app.post('/notify',sendCustomNotification)