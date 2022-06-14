const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const login = require('../models/login');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/signup',async (req,res)=>{

    const options = Object.keys(req.body);
    const optionMain = ['name','email','password'];
    const isMatch = options.every((option) => optionMain.includes(option) )

    if(!isMatch){
        return res.status(400).send({error:'You Provide Invalid Option !!'})
    }

    try{
        const user = await new login(req.body)
        const token = await user.generateAuthTokens();
        await user.save();
        res.status(201).send({user,token})
        
    }
    catch(e){
        res.status(500).send(e)
    }
})

router.post('/signin',async (req,res)=>{

    try{
        const user = await login.findByCredentials(req.body.email,req.body.password)

        const token = await user.generateAuthTokens();

        res.status(200).send({user,token})    

    }
    catch(e){
        res.status(500).send(e)
    }

})

router.get('/users/me',auth,async (req,res)=>{

    res.send(req.user)

})

router.patch('/login/me',auth,async (req,res)=>{
    const update = Object.keys(req.body);
    const updateAllowed = ['name','email','password'];
    const isMatch = update.every((update) => updateAllowed.includes(update))

    if(!isMatch){
        res.status(400).send({error : 'Invalid Update'})
    }

    try{
        
        update.every((update)=> req.user[update] = req.body[update])
        await req.user.save()
        res.status(201).send(req.user)
    }
    catch(e){
        res.status(400).send(e)
    }

})

router.post('/logout',auth,async (req,res)=>{

    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        req.user.save();
        res.send()
    }
    catch(e){
        res.status(500).send(e)
    }
})

router.post('/logoutAll',auth,async (req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }
    catch(e){
        res.status(500).send(e)
    }
})

router.delete('/users/me',auth,(req,res)=>{

    try{
        req.user.remove()
        res.send(req.user)    
    }
    catch(e){
        res.status(400).send(e)
    }

})
const upload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file ,callback){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return callback(new Error('please select an image'))
        }
        callback(undefined, true)
    }

    
})


router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{

    req.user.avatar = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
    })

router.delete('/users/me/avatar',auth,async (req,res)=>{

    try{
    req.user.avatar = undefined
    await req.user.save()
    res.status(200).send()
    }
    catch(e){
        res.status(400).send(e)
    }
})

router.get('/users/:id/avatar',async (req,res)=>{

    try{

        const _id = req.params.id;
        const user = await login.findById(_id);

        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type','image/jpg')
        res.send(user.avatar)

    }
    catch(e){
        res.status(400).send(e)
    }

})

module.exports = router;
