const {connection} = require('../util/connect')
const multer = require('multer')

exports.addProduct = (req,res) => {

    console.log("::::::::::::::::::;;;;;;;;;;;;;;;");
    console.log(req);

    var shop_id = req.shop.shop_id;
    var product_name = req.body.product_name;
    var product_price = parseInt(req.body.product_price);
    var product_type = req.body.product_type;
    var product_quantity = parseInt(req.body.product_quantity);
    //var product_image = req.body.product_image || "";
    var product_image = req.body.product_image.toString();
    var product_description = req.body.product_description || "new product"

    const INSERT_PRODUCT = `INSERT INTO products (product_name,shop_id,product_price,product_quantity,product_type,product_image,product_description) VALUES ('${product_name}',${shop_id},${product_price},'${product_quantity}','${product_type}','${product_image}','${product_description}')`

    connection.query(INSERT_PRODUCT,(err,result) => {
        if(err){
            return res.json(err)
        } else {
            var product_id = result.insertId;
                const product = {
                    product_id,
                    product_name,
                    shop_id,
                    product_price,
                    product_type,
                    product_quantity,
                    product_image:req.body.product_image,
                    product_description
                }
            return res.json(product)
        }
    })
}

exports.updateProduct = (req,res) => {

    console.log("Req comming here atleast");

    console.log(req.body);
    console.log(req.shop);

    var shop_id = req.shop.shop_id;
    var product_id = parseInt(req.params.product_id);
    var product_name = req.body.product_name;
    var product_price = parseFloat(req.body.product_price);
    var product_type = req.body.product_type;
    var product_quantity = parseInt(req.body.product_quantity);
    var increase_quantity = parseInt(req.body.increase_quantity);
    var decrease_quantity = parseInt(req.body.decrease_quantity);
    var product_image = req.body.product_image.toString();
    var product_description = req.body.product_description || 'new product'

    console.log(product_price);

    product_quantity = product_quantity + increase_quantity - decrease_quantity;

    const CHECK_PRODUCT = `SELECT * FROM products WHERE product_id=${product_id}`

    const UPDATE_PRODUCT = `UPDATE products SET product_quantity=${product_quantity},product_name='${product_name}',product_price='${product_price}',product_description='${product_description}',product_type='${product_type}',product_image='${product_image}' WHERE product_id=${product_id}`

    connection.query(CHECK_PRODUCT,(err,result) => {
        if(err){
            return res.json(err)
        } else {
            console.log("CP" , result);
            if(result.length > 0){
                connection.query(UPDATE_PRODUCT,(err,result) => {
                    const product = {
                        product_id,
                        shop_id,
                        product_name,
                        product_price,
                        product_quantity,
                        product_type,
                        product_image:req.body.product_image,
                        product_description
                    }
                    console.log("RES" , result);
                    return res.json(product)
                })
            } else {
                return res.json({error : 'Product does not exist'})
            }
        }
    })
}

exports.deleteProduct = (req,res) => {
    var product_id = parseInt(req.params.product_id)
    var shop_id = req.shop.shop_id;

    const CHECK_PRODUCT = `SELECT * FROM products WHERE product_id=${product_id}`

    const DELETE_PRODUCT = `DELETE FROM products WHERE product_id=${product_id} AND shop_id=${shop_id}`

    connection.query(CHECK_PRODUCT,(err,result) => {
        if(err){
            return res.json(err)
        } else {
            if(result.length > 0){
                connection.query(DELETE_PRODUCT,(err,result) => {
                    return res.json({message : 'Product Deleted Successfully'})
                })
            } else {
                return res.json({error : 'Product does Not Exist'})
            }
        }
    })
}

exports.getOrders = (req,res) => {
    var shop_id = req.shop.shop_id

    const GET_ORDERS = `SELECT ordered_items.ordered_item_id,ordered_items.order_cart_id,ordered_items.product_id,ordered_items.product_price,ordered_items.quantity,ordered_items.total,ordered_items.payment_mode,ordered_items.payment_status,ordered_items.delivery_status,order_cart.consumer_id,order_cart.ordered_time,order_cart.order_cart_total,consumer.consumer_id,consumer.consumer_email,consumer.consumer_contact,consumer.consumer_address,products.product_name
    FROM ordered_items
    INNER JOIN order_cart
    ON ordered_items.order_cart_id = order_cart.order_cart_id AND ordered_items.shop_id=${shop_id}
    INNER JOIN consumer
    ON order_cart.consumer_id=consumer.consumer_id AND ordered_items.shop_id=${shop_id}
    INNER JOIN products
    ON ordered_items.product_id=products.product_id 
    ORDER BY order_cart.ordered_time
    `

    connection.query(GET_ORDERS,(err,result) => {
        if(err){
            return res.json(err)
        } else {
            function convert(result){
                console.log(result)
                var fin = {}
                var n = result.length
                for(var i=0;i<n;i++){
                    if(fin[result[i].order_cart_id]){
                        fin[result[i].order_cart_id].push(result[i])
                    } else {
                        fin[result[i].order_cart_id]=[]
                        fin[result[i].order_cart_id].push(result[i])
                    }
                }
                return fin
            }
            if(result.length>0){
                var final = convert(result)
                //console.log(final)
                return res.json(final)
            } else {
                return res.json({error : 'No Orders Placed ! Yet'})
            }
        }
    })
}

exports.getCurrentOrders = (req,res) => {

    console.log("Fecthing Orders from current users");
    console.log(req);

    var shop_id = req.shop.shop_id

    const GET_ORDERS = `SELECT order_cart.order_cart_id,order_cart.order_cart_total,sum(ordered_items.total) as tota,order_cart.ordered_time,ordered_items.payment_mode,ordered_items.payment_status,consumer.consumer_id,consumer.consumer_email,consumer.consumer_name,address.consumer_address,consumer.consumer_contact,ordered_items.delivery_status
    FROM order_cart
    INNER JOIN ordered_items
    ON order_cart.order_cart_id=ordered_items.order_cart_id AND ordered_items.shop_id=${shop_id} AND ordered_items.delivery_status="pending"
    Inner Join consumer
    ON order_cart.consumer_id=consumer.consumer_id
    Inner Join address
    on order_cart.addressId=address.addressId
    GROUP BY order_cart.order_cart_id
    ORDER BY order_cart.ordered_time
    `

    connection.query(GET_ORDERS,(err,result) => {
        if(err){
            return res.json(err)
        } else {
            if(result.length>0){
                return res.json(result)
            } else {
                return res.json([])
            }
        }
    })
}

exports.getShopProducts = (req , res) => {
    var shop_id = req.shop.shop_id;

    const GET_DETAILS = `SELECT * FROM test_schema.products where products.shop_id=${shop_id}`

    connection.query(GET_DETAILS,(err,result) => {
        if(err){
            return res.json(err)
        } else {
            var products = []
            for(var i =0;i< result.length;i++){
                var product = result[i];
                var images = result[i].product_image;
                var aimages = images.split(',')
                product.product_image=aimages
                products.push(product)
            }
            return res.json(products)
        }
    })
}

exports.getOrderDetails = (req,res) => {
    console.log("GETTING DETAILS");
    var shop_id = req.shop.shop_id
    var order_cart_id = req.params.order_cart_id

    const GET_DETAILS = `SELECT ordered_item_id,order_cart_id,ordered_items.product_id,ordered_items.product_price,ordered_items.shop_id,quantity,total,payment_mode,payment_status,delivery_status,payment_mode,payment_status,ordered_items_time,product_name,product_type,product_image FROM test_schema.ordered_items
    Inner join products where products.product_id=ordered_items.product_id and order_cart_id=${order_cart_id} and ordered_items.shop_id=${shop_id}`

    connection.query(GET_DETAILS,(err,result) => {
        if(err){
            return res.json(err)
        } else {
            var products = []
            for(var i =0;i< result.length;i++){
                var product = result[i];
                var images = result[i].product_image;
                var aimages = images.split(',')
                product.product_image=aimages
                products.push(product)
            }
            return res.json(result)
        }
    })
}

exports.updateDeliveryStatus = (req,res) => {
    console.log("Comming here");
    var order_cart_id = req.params.order_cart_id;
    var shop_id = req.shop.shop_id
    var type = req.body.type

    const GET_DET = `SELECT delivery_status FROM ordered_items WHERE order_cart_id=${order_cart_id} AND shop_id=${shop_id}`

    connection.query(GET_DET,(err,result) => {
        if(err){
            return res.json(err)
        } else {

            if(type=="pending")
            {
                const SET_DELB = `UPDATE ordered_items SET delivery_status='pending' WHERE order_cart_id=${order_cart_id} AND shop_id=${shop_id}`
                connection.query(SET_DELB)
                return res.json({delivery : 'pending'})
            }

            if(type=="OutForDelivery")
            {
                const UPDATE_DELIVERY = `UPDATE ordered_items SET delivery_status='Out For Delivery' WHERE order_cart_id=${order_cart_id} AND shop_id=${shop_id}`
                connection.query(UPDATE_DELIVERY)
                return res.json({delivery : 'Out For Delivery'})
            }

            if(type=="Delivered")
            {
                const SET_DEL = `UPDATE ordered_items SET delivery_status='Delivered' WHERE order_cart_id=${order_cart_id} AND shop_id=${shop_id}`
                connection.query(SET_DEL)
                return res.json({delivery : 'Delivered'})
            }
        }
    })
}

exports.updatePaymentStatus = (req,res) => {
    var order_cart_id = req.params.order_cart_id;
    var shop_id = req.shop.shop_id;

    const GET_DET = `SELECT payment_status FROM ordered_items WHERE order_cart_id=${order_cart_id} AND shop_id=${shop_id} AND payment_mode="cod"`

    const UPDATE_PAYMENT = `UPDATE ordered_items SET payment_status='Pending' WHERE order_cart_id=${order_cart_id} AND shop_id=${shop_id}`

    const UPDATE_PAYMENT_TC = `UPDATE ordered_items SET payment_status='Done' WHERE order_cart_id=${order_cart_id} AND shop_id=${shop_id}`

    connection.query(GET_DET,(err,result) => {
        if(err){
            return res.json(err)
        } else {
            if(result.length>0){
                if(result[0].payment_status==="Done"){
                    connection.query(UPDATE_PAYMENT)
                    return res.json({payment : 'Pending'})
                } else {
                    connection.query(UPDATE_PAYMENT_TC)
                    return res.json({payment : 'Done'})
                }
            }
        }
    })
}

exports.getDeliveredProducts = (req,res) => {
    var shop_id = req.shop.shop_id

    const GET_ORDERS = `SELECT order_cart.order_cart_id,sum(ordered_items.total) as tota,order_cart.order_cart_total,order_cart.ordered_time,ordered_items.payment_mode,ordered_items.payment_status,consumer.consumer_id,consumer.consumer_email,consumer.consumer_name,consumer.consumer_address,consumer.consumer_contact,ordered_items.delivery_status
    FROM order_cart
    INNER JOIN ordered_items
    ON order_cart.order_cart_id=ordered_items.order_cart_id AND ordered_items.shop_id=${shop_id} AND ordered_items.delivery_status="Delivered"
    Inner Join consumer
    ON order_cart.consumer_id=consumer.consumer_id
    GROUP BY order_cart.order_cart_id
    ORDER BY order_cart.ordered_time DESC
    `

    connection.query(GET_ORDERS,(err,result) => {
        if(err){
            return res.json(err)
        } else {
            if(result.length>0){
                return res.json(result)
            } else {
                return res.json([])
            }
        }
    })
}

exports.getOutForDeliveryProducts = (req,res) => {
    var shop_id = req.shop.shop_id

    const GET_ORDERS = `SELECT order_cart.order_cart_id,sum(ordered_items.total) as tota,order_cart.order_cart_total,order_cart.ordered_time,ordered_items.payment_mode,ordered_items.payment_status,consumer.consumer_id,consumer.consumer_email,consumer.consumer_name,consumer.consumer_address,consumer.consumer_contact,ordered_items.delivery_status
    FROM order_cart
    INNER JOIN ordered_items
    ON order_cart.order_cart_id=ordered_items.order_cart_id AND ordered_items.shop_id=${shop_id} AND ordered_items.delivery_status="Out For Delivery"
    Inner Join consumer
    ON order_cart.consumer_id=consumer.consumer_id
    GROUP BY order_cart.order_cart_id
    ORDER BY order_cart.ordered_time DESC
    `

    connection.query(GET_ORDERS,(err,result) => {
        if(err){
            return res.json(err)
        } else {
            if(result.length>0){
                return res.json(result)
            } else {
                return res.json([])
            }
        }
    })
}