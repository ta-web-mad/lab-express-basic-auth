const express = require('express')
const router = express.Router()
const bcrypt = require("bcrypt")
const bcryptSalt = 10

const User = require('./../models/user.model')

// Endpoints
router.get('/', (req, res) => res.render('pages/index'))
router.get('/sign-up', (req, res) => res.render('pages/sign-up'))
router.get('/login', (req, res) => res.render('pages/login'))


router.get('/register', (req, res) => res.render('pages/sign-up'))

router.post('/register', (req, res) => {
const { username, pwd } = req.body

    if (username.length === 0 || pwd.length === 0) {
        res.render('pages/sign-up', { errorMessage: 'Rellena los campos' })
        return
    }
    // else {
    //     console.log(username, pwd)
    // }


    User
        .findOne({ username })
        .then(user => {
            if (user) {
                res.render('pages/sign-up', { errorMessage: 'Nombre de usuario ya registrado' })
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

router.get('/access', (req, res) => res.render('pages/login'))


router.post('/access', (req, res) => {

    const { username, pwd } = req.body

    User
        .findOne({ username })
        .then(user => {

            if (!user) {
                res.render('pages/login', { errorMessage: 'Usuario no reconocido' })
                return
            }

            if (bcrypt.compareSync(pwd, user.password) === false) {
                res.render('pages/login', { errorMessage: 'Contraseña incorrecta' })
                return
            }
            // else{
            //     console.log('usuario', username, 'encontrado')
            // }

            req.session.currentUser = user
            console.log('Tengo aqui el usuario!', req.session)
            res.redirect('/')
            //console.log(req.session.currentUser)
        })
        .catch(err => console.log('error', err))
    })
    router.get('/logout', (req, res) => {
    req.session.destroy((err) => res.redirect("/login"));
})

    router.use((req, res, next) => req.session.currentUser ? next() : res.redirect('/login'))
    
    router.get('/private', (req, res) => {
        res.render('pages/private')
    })

    router.get('/main', (req, res) => {
        res.render('pages/main')
    })



module.exports = router
