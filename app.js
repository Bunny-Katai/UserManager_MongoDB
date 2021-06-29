const express = require('express');
const path = require('path');
const port = process.env.PORT || 3210;
const mongoose = require('mongoose');
const app = express();

mongoose.connect('mongodb://localhost:27017/tai', { useNewUrlParser: true, useUnifiedTopology: true });

const dbClient = mongoose.connection;
dbClient.on('error', console.error.bind(console, 'connection error: ""'));
dbClient.once('open', () => {
    console.log('dbClient connected');
});

const usersSchema = new mongoose.Schema({
    userId: String,
    name: String,
    email: String,
    age: Number
});

const Users = mongoose.model('Users', usersSchema);


app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')))

app.set('views','./views' );
app.set('view engine', 'pug');

app.get('/', (req, res)=> {
    Users.find({}, (error, data) => {
        if (error) throw error;
        res.render('index', { 'users': data });
    });
});

app.get('/users', (req, res) => {
    Users.find().or([
        { userId: new RegExp(req.query.search, 'i') },
        { name: new RegExp(req.query.search, 'i') },
        { email: new RegExp(req.query.search, 'i') }
    ]).exec((error, data) => {
        if (error) throw error;
        res.render('index', { 'users': data });
    });
});

app.get('/users/ascending', (req, res) => {
    Users.find().sort([['name', 1]]).exec((error, data) => {
        if (error) throw error;
        res.render('index', { 'users': data });
    });
});

app.get('/users/descending', (req, res) => {
    Users.find().sort([['name', -1]]).exec((error, data) => {
        if (error) throw error;
        res.render('index', { 'users': data });
    });
});

app.get('/create', (req, res) => {
    res.render('form');
})
        
app.get('/users/:_id', (req,res) => {
    Users.findById(req.params._id, (error, data) => {
        if (error) throw error;
        res.render('edit', { 'user': data });
    });
});

app.post('/users/:_id', (req, res) => {
    const update = {
        userId: req.body.userId,
        name: req.body.name,
        email: req.body.email,
        age: req.body.age
    };

    Users.findByIdAndUpdate(req.params._id, update, (error, data) => {
        if (error) throw error;
        res.redirect('/');
    });
});

app.get('/delete/:_id', (req, res) => {
    Users.findByIdAndRemove(req.params._id, (error, data) => {
        if (error) throw error;
        res.redirect('/');
    });
});

app.post('/create', (req, res) => {
    const user = {
        userId: req.body.userId,
        name: req.body.name,
        email: req.body.email,
        age: req.body.age
    };

    Users.create(user);
    res.redirect('/');
});

app.all('*', (req, res) => {
    res.redirect('/');
})

app.listen(port , (err) => { if (err) console.log(err)
    console.log(`Listening on port: ${port}`);
});