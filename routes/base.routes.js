const express = require('express')
const bodyParser = require('body-parser')
const router = express.Router()
const bcrypt = require("bcrypt")
const bcryptSalt = 10

const User = require("./../models/user.model")

// Endpoints
router.get('/', (req, res) => res.render('pages/index'))

// Signup form (get)
router.get('/sign-up', (req, res) => res.render('pages/signup-form'))

// Signup (post)
router.post('/sign-up', (req, res) => {

    const { username, pwd } = req.body

    if (username.length === 0 || pwd.length === 0) {
        res.render('pages/signup-form', { errorMessage: 'Fill the fields!' })
        return
    }

    User
        .findOne({ username })
        .then(user => {
            if (user) {
                res.render('pages/signup-form', { errorMessage: 'You cannot register a user already registered!' })
                return
            }

            const salt = bcrypt.genSaltSync(bcryptSalt)
            const hashPass = bcrypt.hashSync(pwd, salt)

            User
                .create({ username, password: hashPass })
                .then(() => res.redirect('/'))
                .catch(err => console.log('error', err))
        })
        .catch(err => console.log('error', err))
})

// Login (get)
router.get('/login-form', (req, res) => res.render('pages/login-form'))

// Login (post)
router.post('/login-form', (req, res) => {

    const { username, pwd } = req.body

    User
        .findOne({ username })
        .then(user => {

            if (!user) {
                res.render('pages/login-form', { errorMessage: 'This user does not exist!' })
                return
            }

            if (bcrypt.compareSync(pwd, user.password) === false) {
                res.render('pages/login-form', { errorMessage: 'Wrong password' })
                return
            }
            // console.log(req.session);
            req.session.currentUser = user
            res.redirect('/main')
        })
        .catch(err => console.log('error', err))
})

router.get('/log-out', (req, res) => {
    req.session.destroy((err) => res.redirect("/login-form"));
})

// DETECTOR SESION
router.use((req, res, next) => req.session.currentUser ? next() : res.redirect('/login-form'))

// PRIVATE ROUTES
router.get('/main', (req, res) => {
    res.render('pages/main', req.session.currentUser)
})

router.get('/private', (req, res) => {
    res.render('pages/private', req.session.currentUser)
})

module.exports = router
