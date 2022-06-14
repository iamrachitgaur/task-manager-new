const express = require('express');
const tasks = require('../models/tasks');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/tasks',auth,async (req,res)=>{
    const task = new tasks({
        ...req.body,
        owner: req.user._id
    })
    await task.save()

    try{
        res.status(201).send(task)
    }
    catch(e){
        res.status(500).send(e)
    }
})

router.get('/tasks',auth,async (req,res)=>{

    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split('_')
        sort[parts[0]] = parts[1] === 'desc'? -1:1
    }

    // const user = await tasks.find({owner:req.user._id})
        const user = await req.user.populate({
            path:'task',
            match,
            options:{
                limit: req.query.limit === undefined?0:parseInt(req.query.limit),
                skip: req.query.skip === undefined?0:parseInt(req.query.skip),
                sort
            }
        })
    try{
        res.status(200).send(user.task)
    }
    catch(e){
        res.status(501).send(e)
    }
})

router.get('/tasks/:id',auth,async (req,res)=>{

    const _id = req.params.id;

    try{
        const task = await tasks.findOne({_id,owner:req.user._id})
        if(!task){
           return res.status(404).send()
        }

        res.status(200).send(task)


    }
    catch(e){
        res.status(500).send(e)
    }

})

router.patch('/tasks/:id',auth,async (req,res)=>{
    const _id = req.params.id;

    const update = Object.keys(req.body)
    const allowedUpdates = ['description','completed']
    const isValidOperation = update.every((update)=> allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error: 'invalid update'})
    }

    try{
        console.log(_id,req.user._id)
        const task = await tasks.findOne({_id,owner:req.user._id})
        
        update.forEach((update) => task[update] = req.body[update])
        await task.save();

        res.status(200).send(task)

    }
    catch(e){
        res.status(500).send(e)
    }
})

router.delete('/tasks/:id',auth,async (req,res)=>{
    const _id = req.params.id;
    try{
    const task = await tasks.findOneAndDelete({_id,owner:req.user._id})
    
    res.status(200).send(task)

    }
    catch(e){
        res.status(500).send(e)
    }


})

router.delete('/tasks',auth,async (req,res)=>{

    try{
        const task = await tasks.deleteMany({owner:req.user._id})
        res.status(200).send(task)
    }
    catch(e){
        res.status(500).send(e)
}

})



module.exports = router;