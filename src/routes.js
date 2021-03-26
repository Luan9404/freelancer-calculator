const express = require('express')
const routes = express.Router()

routes.get('/', (req,res) => {
    return res.sendFile(__dirname + "/views/index.html");
})

routes.get('/index.html', (req,res) => {
    return res.redirect('/');
})

module.exports = routes;