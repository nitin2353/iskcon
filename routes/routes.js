const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const User = require('../module/user');

// Session Setup
router.use(session({
    secret: "SECRETKEY",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365
    } 
}));

// Routes
router.get('/account', (req, res) => {
    res.render('signup');
});

router.get('/', (req, res) => {
    if (req.session.isAuth === true) {
        res.render('index');
    } else {
        res.redirect('/account');
    }
});

router.get('/users', (req, res) => {
    res.render('users');
});

router.get('/allUsers', async (req, res) => {
    try {
        const users = await User.find().sort({ mala_count: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
});

router.get('/myDetail', async (req, res) => {
    try {
        const users = await User.find({ phone: req.session.mobile });
        res.json(users);
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
});

// -------------------- Sign Up --------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../users_img'));
    },
    filename: (req, file, cb) => {
        const filename = `${Date.now()}-${file.originalname}`;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

router.post('/signupYouthData', upload.single('photo'), async (req, res) => {
    try {


        const newUser = new User({
            name: req.body.name,
            image: req.file.filename, 
            phone: req.body.phone,
            password: req.body.password,
            date: Date.now(),
            count: 0,
            mala_count: 0,
            total_mala: 0
        });

        await newUser.save();
        req.session.isAuth = true;
        req.session.mobile = req.body.phone;
        res.redirect('/');
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
});

// -------------------- Login --------------------
router.post('/loginYouthData', async (req, res) => {
    const phone = req.body.phone;
    const password = req.body.password;

    try {
        const data = await User.findOne({ phone: phone });

        if (data) {

            const isMatch = (data.password === password); 

            if (isMatch) {
                req.session.isAuth = true;
                req.session.mobile = phone;
                res.redirect('/');
            } else {
                res.redirect('/account');
            }
        } else {
            res.redirect('/account');
        }
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
});

// -------------------- Mala Update --------------------
router.post('/chantingupdate', async (req, res) => {
    try {
        const chant = await User.findOne({ phone: req.session.mobile });

        if (!chant) {
            return res.status(404).send('User not found');
        }

        if (chant.count === 108) {
            await User.updateOne(
                { phone: req.session.mobile },
                { $set: { count: 0 }, $inc: { mala_count: 1 } }
            );
        } else {
            await User.updateOne(
                { phone: req.session.mobile },
                { $inc: { count: 1 } }
            );
        }

        const updatedUser = await User.findOne({ phone: req.session.mobile });
        res.json(updatedUser);
    } catch (error) {
        console.log('Error Occurred: ' + error);
        res.status(500).send('Error: ' + error.message);
    }
});

module.exports = router;
