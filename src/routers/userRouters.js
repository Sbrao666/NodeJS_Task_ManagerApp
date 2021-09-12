const express = require("express")
const User = require("../models/user")
const router = new express.Router()
const multer = require("multer")
const auth = require("../middleware/auth")
const { userWelcomeEmail, userDeleteEmail } = require("../emails/accounts")


router.post("/users", async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        userWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(200).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }

    // user.save().then(
    //     () => {
    //         res.status(201).send(user)
    //     }
    // ).catch(
    //     (error) => {
    //         res.status(400).send({
    //             error: error.errors.email.message
    //         })
    //     })
})

router.post("/users/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({ user, token })
    } catch (error) {
        console.log(error)
        res.status(400).send({ error: "Unable to login" })
    }
})

router.post("/users/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send({ message: "Logged out..." })
    } catch (e) {
        res.status(500).send()
    }
})

router.post("/users/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send({ message: "Logged out from all ..." })
    } catch (e) {
        res.status(500).send()
    }
})

router.get("/users/me", auth, async (req, res) => {

    res.send(req.user)
    // try {
    //     const users = await User.find()
    //     users.length > 0 ?
    //         res.status(200).send(users) :
    //         res.status(404).send({ message: "No user data found" })

    // } catch (error) {
    //     res.status(500).send()
    // }

    // User.find().then((users) => {
    //     users.length > 0 ?
    //         res.status(200).send(users) :
    //         res.status(404).send({ message: "No user data found" })
    // }).catch((error) => {
    //     res.status(500).send()
    // })
})

const upload = multer({
    limits: {
        fileSize: 2000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match('\.(jpe?g|png)$')) {
            return cb(new Error("Only jpg, jpeg and png file supported."))
        }
        cb(undefined, true)
    }
})

router.post("/users/me/avatar", auth, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error("Please select an image first")
        }
        req.user.avatar = req.file.buffer
        await req.user.save()
        res.send({ message: "File is uploaded" })

    } catch (error) {
        res.status(400).send({ error: error.message })
    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get("/users/:id/avatar", async (req, res) => {
    try {
        const _id = req.params.id
        const user = await User.findById({ _id })
        if (!user) {
            throw new Error("User not found")
        }
        if (!user.avatar) {
            throw new Error("User not having avatar")
        }
        res.set('Content-Type', 'image/jpg')
        res.status(200).send(user.avatar)
    } catch (error) {
        res.status(400).send({ error: error.message })
    }
})

router.delete("/users/me/avatar", auth, async (req, res) => {
    try {
        if (!req.user.avatar) {
            throw new Error("No avatar found to delete")
        }
        req.user.avatar = undefined
        req.user.save()
        res.status(200).send({ message: "Avatar has been removed." })
    } catch (error) {
        res.status(400).send({ error: error.message })
    }

})


// router.get("/users/:id", async (req, res) => {
//     const _id = req.params.id
//     if (!validator.isMongoId(_id)) {
//         return res.status(400).send({ error: "Invalid MongoId in params" })
//     }
//     try {
//         const user = await User.findById(_id)
//         user ? res.status(200).send(user) :
//             res.status(404).send({ message: _id + " not found" })
//     } catch (error) {
//         res.status(500).send()
//     }
//     // User.findById(_id).then((user) => {
//     //     user ? res.status(200).send(user) :
//     //         res.status(404).send({ message: _id + " not found" })
//     // }).catch((error) => {
//     //     res.status(500).send()
//     // })
// })


router.patch("/users/me", auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["name", "email"]
    const validateupdates = updates.every(update => allowedUpdates.includes(update))
    if (!validateupdates) {
        return res.status(400).send({ error: "Invalid key in the request body" })
    }
    const _id = req.user._id
    try {
        const user = await User.findById(_id)
        updates.forEach(update => user[update] = req.body[update])
        await user.save()
        user ? res.status(201).send(user) :
            res.status(400).send({ message: "_id : " + _id + " not found in the database." })
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete("/users/me", auth, async (req, res) => {
    try {
        await req.user.remove()
        userDeleteEmail(req.user.email, req.user.name)
        res.status(201).send(req.user)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
})


module.exports = router