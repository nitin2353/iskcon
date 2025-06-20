const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const User = require('../models/User'); // ✅ check this matches your folder name

// ✅ Configure Session
router.use(session({
    secret: process.env.SECRET, // ✅ fixed: using correct env key
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365
    } 
}));

// ✅ Render signup page
router.get('/', (req, res) => {
    res.render('signup');
});

// ✅ Protected route
router.get('/haribol', (req, res) => {
    if (req.session.isAuth === true) {
        res.render('index');
    } else {
        res.redirect('/');
    }
});

router.get('/users', (req, res) => {
    res.render('users');
});

// ✅ Get all users sorted by mala_count
router.get('/allUsers', async (req, res) => {
    try {
        const users = await User.find().sort({ mala_count: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).send("DB Error: " + err);
    }
});

// ✅ Get details of logged-in user
router.get('/myDetail', async (req, res) => {
    try {
        const users = await User.find({ phone: req.session.mobile });
        res.json(users);
    } catch (err) {
        res.status(500).send("DB Error: " + err);
    }
});


// -------------------- Sign Up --------------------

let img_path;
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        return cb(null, path.join(__dirname, '../users_img'));
    },
    filename: (req, file, cb) => {
        img_path = `${Date.now()}-${file.originalname}`;
        return cb(null, img_path);
    }
});

const upload = multer({ storage: storage });

router.post('/signupYouthData', upload.single('photo'), async (req, res) => {
    const newUser = new User({
        name: req.body.name,
        image: img_path,
        phone: req.body.phone,
        password: req.body.password,
        date: Date.now(),
        count: 0,
        mala_count: 0
    });

    try {
        await newUser.save();
        req.session.isAuth = true;
        req.session.mobile = req.body.phone; // ✅ fixed
        res.redirect('/haribol');
    } catch (error) {
        res.send('Not submitted: ' + error);
    }
});


// -------------------- Login --------------------
router.post('/loginYouthData', async (req, res) => {
    const phone = req.body.phone;
    const password = req.body.password;

    try {
        const data = await User.findOne({ phone: phone, password: password });
        if (data) {
            req.session.isAuth = true;
            req.session.mobile = phone;
            res.redirect('/haribol');
        } else {
            res.redirect('/');
        }
    } catch (error) {
        res.redirect('/');
    }
});


// -------------------- Mala Update --------------------
router.post('/chantingupdate', async (req, res) => {
    try {
        const user = await User.findOne({ phone: req.session.mobile });

        if (!user) return res.status(404).send('User not found');

        let newCount = user.count + 1;
        let newMala = user.mala_count;

        if (user.count >= 108) {
            newCount = 0;
            newMala = user.mala_count + 1;
        }

        await User.updateOne({ phone: req.session.mobile }, {
            $set: {
                count: newCount,
                mala_count: newMala
            }
        });

        res.send("✅ Chanting updated");

    } catch (error) {
        console.error('Error Occurred: ' + error);
        res.status(500).send("❌ Internal server error");
    }
});

module.exports = router;
