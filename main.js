var express = require('express')
var session = require('express-session')

const { MongoClient } = require('mongodb')

var mongoClient = require('mongodb').MongoClient
var url = 'mongodb://127.0.0.1:27017'

var app = express()


app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: 'my secrete !@#$$%%@@$%$@#%%@#%##',
    resave: false
}))

function isAuthenticated(req, res, next) {
    let chuaDangNhap = !req.session.userName
    if (chuaDangNhap)
        res.redirect('/')
    else
        next()
}

app.get('/', (req, res) => {
    let accessCount = req.session.accessCount || 0
    accessCount++
    req.session.accessCount = accessCount
    let chuaDangNhap = !req.session.userName
    res.render('home', { 'accessCount': accessCount, 'chuaDangNhap': chuaDangNhap })
})

app.post('/register', async(req, res) => {
    let name = req.body.txtName
    let pass = req.body.txtPassword
    let server = await MongoClient.connect(url)
    let dbo = server.db("University")
    req.session.userName = name
    let user = await dbo.collection("users").find({ $and: [{ 'name': name }, { 'pass': pass }] }).toArray()
    if (user.length > 0) {
        res.redirect('/profile')
    } else {
        res.write('khong hop le')
        res.end()
    }

})

app.get('/signup', (req, res) => {
    res.render('signup')
})
app.post('/signupPro', async(req, res) => {
    let name = req.body.name
    let pass = req.body.pass
    let country = req.body.country
    if (name.length <= 3) {
        res.render('signup', { 'error': ">=5, right" })
        return
    }
    let account = {
        'name': name,
        'pass': pass,
        'country': country
    }
    let server = await MongoClient.connect(url)
    let dbo = server.db("University")
    await dbo.collection("users").insertOne(account)
    res.redirect('/')
})
app.get('/logout', (req, res) => {
    req.session.userName = null
    req.session.save((err) => {
        req.session.regenerate((err2) => {
            res.redirect('/')
        })
    })
})


app.get('/profile', isAuthenticated, async(req, res) => {
    let server = await MongoClient.connect(url)
    let dbo = server.db("University")
    let account = await dbo.collection('users').find({
        'name': req.session.userName
    }).toArray()
    res.render('profile', { 'account': account, 'ID': req.sessionID })
})
const PORT = process.env.PORT || 5000
app.listen(PORT)
console.log('Runnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn')