const express = require('express')
const router = express.Router()
const bcrypt = require("bcrypt")
const bcryptSalt = 10

const User = require('./../models/user.model')


// Endpoints
router.get('/', (req, res) => res.render('pages/index'))
router.get('/main', (req, res) => res.render('pages/main'))

router.post('/register', (req, res) => {

    const { username, pwd } = req.body

    User
        .findOne({ username })
        .then(user => {
            if (user) {
                res.render('pages/index')
                return
            }

            const salt = bcrypt.genSaltSync(bcryptSalt)
            const hashPass = bcrypt.hashSync(pwd, salt)

            User
                .create({ username, password: hashPass })
                .then(() => res.redirect('/'))
                .catch(err => console.log('error', err))
        })
        .catch(err => console.log('errrrrror!!', err))
})

router.get('/login', (req, res) => res.render('pages/login'))

router.post('/login', (req, res) => {

    const { username, pwd } = req.body

    User
        .findOne({ username })
        .then(user => {

            if (!user) {
                res.render('pages/login')
                return
            }

            if (bcrypt.compareSync(pwd, user.password) === false) {
                res.render('pages/login')
                return
            }

            req.session.currentUser = user
            console.log('Tengo aqui el usuario!', req.session)
            res.redirect('/')
        })
        .catch(err => console.log('error', err))
})

router.get('/close-session', (req, res) => {
    req.session.destroy((err) => res.redirect("/"));
})


router.use((req, res, next) => req.session.currentUser ? next() : res.redirect('/main'))

router.get('/private', (req, res) => {
    res.render('pages/private', req.session.currentUser)
})


module.exports = router
