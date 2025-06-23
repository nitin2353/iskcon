require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT;
const path = require('path');
const router = require('./routes/routes.js');
const connectDB = require('./database/database.js')

connectDB();

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views') );
app.use(express.static(__dirname))
app.use('/',router);

app.listen(port, () => {
    console.log('Server is Started on port :', port);
})

