const express = require("express")
const Tasks = require("../models/tasks")
const router = new express.Router()
const validator = require("validator");
const auth = require("../middleware/auth")
const User = require("../models/user")


router.post("/tasks", auth, async (req, res) => {
    req.body.owner = req.user._id
    const task = new Tasks(req.body)
    task.owner = req.user._id //concat owner with task object
    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
    // task.save().then(() => {
    //     res.status(201).send(task)
    // }).catch((error) => {
    //     res.status(400).send(error)
    // })
})

router.get("/tasks", auth, async (req, res) => {
    const match = {}
    const sort = {}
    if (req.query.completed) {
        match.completed = req.query.completed === "true"
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1
    }
    console.log(sort)

    try {
        await req.user.populate({
            path: "tasks",
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            },
        })
        res.send(req.user.tasks)
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
    // Tasks.find().then((tasks) => {
    //     tasks.length > 0 ?
    //         res.status(200).send(tasks) :
    //         res.status(404).send({ message: "No tasks found." })

    // }).catch(() => {
    //     res.status(500).send()
    // })
})

router.get("/tasks/:id", auth, async (req, res) => {
    const task_id = req.params.id
    const owner_id = req.user._id
    if (!validator.isMongoId(task_id)) {
        return res.status(400).send({ error: "Invalid MongoId in params" })
    }
    try {
        const task = await Tasks.findOne({ _id: task_id, owner: owner_id })
        task ? res.status(200).send(task) :
            res.status(404).send({ message: task_id + " not found" })
    } catch (error) {
        res.status(500).send()
    }
    // Tasks.findById(_id).then((task) => {
    //     task ? res.status(200).send(task) :
    //         res.status(404).send({ message: _id + " not found" })
    // }).catch((error) => {
    //     res.status(500).send()
    // })
})


router.patch("/tasks/:id", auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["title", "description", "completed"]
    const validateupdates = updates.every(update => allowedUpdates.includes(update))
    if (!validateupdates) {
        return res.status(400).send({ error: "Invalid key in the request body" })
    }
    const task_id = req.params.id
    const owner_id = req.user._id

    if (!validator.isMongoId(task_id)) {
        return res.status(400).send({ error: "Invalid MongoId in params" })
    }


    try {
        const task = await Tasks.findOne({ _id: task_id, owner: owner_id })
        if (!task) {
            return res.status(404).send({ message: "no task of such id find for current user" })
        }
        updates.forEach(update => task[update] = req.body[update])
        await task.save()
        // const task = await Tasks.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })
        res.status(201).send(task)

    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete("/tasks/:id", auth, async (req, res) => {
    const task_id = req.params.id
    const owner_id = req.user._id
    if (!validator.isMongoId(task_id)) {
        return res.status(400).send({ error: "Invalid MongoId in params" })
    }

    try {
        const task = await Tasks.findOneAndRemove({ _id: task_id, owner: owner_id })
        if (!task) {
            return res.status(404).send({ message: "no task of such id find for current user" })
        }
        res.status(200).send({ task })
    } catch (error) {
        res.status(500).send(error)
    }

})

module.exports = router