let admin = require("firebase-admin");

let serviceAccount = require("../localapp-51523-firebase-adminsdk-sclpc-bb74c15817.json");
const { connection } = require("../util/connect");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


exports.notification = (req,res) => {

       console.log(req.body)
       const message = {
        notification:{
            title:"Testing :}",
            body:"new ad posted click to open"
        },
        tokens:['fn9AiNsHT8a8zAknkkejeR:APA91bGeRkJEubh4tGlNvzWLc6zcxfsra1w2BaPqL4hbjRGcZaTRTrCRNTCz5TySkay3k6xmOhaOTZfVHXUpHkQlOurP9MdqSj4l0NRKM1Ov-ubD7690WTQppxebs8V6sALXWrUhefpl']
    }
    
    admin.messaging().sendMulticast(message).then(res=>{
        console.log('send success')
     }).catch(err=>{
         console.log(err)
     })
 
}

exports.sendCustomNotification = (req,res) => {
    var title = req.body.title
    var info = req.body.message
    var user_id = req.body.user_id
    var user_type = req.body.user_type
    var data = req.body.data

    console.log(data)

    var GET_FCM_TOKEN = `SELECT * FROM fcm_tokens where user_id=${user_id} and user_type='${user_type}'`

    connection.query(GET_FCM_TOKEN,(err,result) => {
        if(err){
            console.log(err)
        } else {
            var tokens = [result[0].fcm_token]
            const message = {
                data:data,  
                notification:{
                    title:title,
                    body:info
                },
                tokens:tokens
            }
 
            console.log(message)
            admin.messaging().sendMulticast(message).then(resp=>{
                console.log('send success')
                return res.json(resp)
             }).catch(err=>{
                 console.log(err)
             })
        }
    })
}
