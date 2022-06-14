const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const tasks = require('../models/tasks');

const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: true

    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true

    },
    password:{
        type: String,
        required: true

    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }],
    avatar:{
        type: Buffer
    }    
},
{
    timestamps: true
})

userSchema.virtual('task',{
    ref:'tasks',
    localField:'_id',
    foreignField:'owner'
})

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar


    return userObject
}

userSchema.methods.generateAuthTokens = async function(){

    const user = this
    const token = jwt.sign({_id: user._id.toString()},process.env.TOKEN_SECRET)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
    
}



userSchema.statics.findByCredentials = async (email,password)=>{
    
    
    const user = await login.findOne({email})
    if(!user){
        throw new Error('unable to signin')
    }

    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error('unable to login')
    }
    return user
}

userSchema.pre('save',async function (next){
    const user = this
    if(user.isModified('password')){
      user.password = await bcrypt.hash(user.password,8)
    }
    next()
})

userSchema.pre('remove',async function (next){
    const user = this
    const task = await tasks.deleteMany({owner:user._id})
    next()
})

const login =mongoose.model('login',userSchema)

module.exports = login;