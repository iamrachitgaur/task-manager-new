const jwt = require('jsonwebtoken');
const login = require('../models/login')

const auth = async (req,res,next)=>{
    try{

    
    const token = req.header('Authorization').replace('Bearer ','');
    const decoded = jwt.verify(token,process.env.TOKEN_SECRET);
    const user = await login.findOne({_id:decoded._id,'tokens.token':token})
        console.log(token)
    if(!user){
        throw new Error()
    }
    req.token = token
    req.user = user
    next()
    
}
    catch(e){
     res.status(500).send({error: 'please Autherticate'})   
    }
}

module.exports = auth;