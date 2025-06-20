const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const User = require('../module/user');

router.use(session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365
    } 
}))


router.get('/', (req, res) => {
    res.render('signup');
})

router.get('/haribol', (req, res) => {
    if(req.session.isAuth == true){
        res.render('index');
    }
    else{
        res.redirect('/')
    }
})

router.get('/users', (req, res) => {
    res.render('users');
})


router.get('/allUsers', async(req, res) => {
    const users = await User.find().sort({ mala_count : -1});
    res.json(users);
})

router.get('/myDetail', async(req, res) => {
    const users = await User.find({ phone : req.session.mobile});
    res.json(users);
})



// --------------------signUp--------------------
var img_path;
const storage = multer.diskStorage({
    destination :(req, file, cb) => {
        return cb(null, path.join(__dirname,'../users_img'))
    },
    filename : (req, file, cb) => {
        img_path = `${Date.now()}-${file.originalname}`;
        return cb(null,`${Date.now()}-${file.originalname}`);
    }
})

const upload = multer({storage : storage})


router.post('/signupYouthData', upload.single('photo'), async (req, res) => {
    
    const newUser = new User({
        name: req.body.name,
        image: img_path,
        phone:  req.body.phone,
        password: req.body.password,
        date: Date.now(),
        count: 0,
        mala_count: 0
    }) 
    try {
        await newUser.save();
        req.session.isAuth = true;
        req.session.mobile=phone;
        res.redirect('/haribol');
    } catch (error) {
        res.send('not submitted' + error);
    }
})


// ---------------------------------login---------------------------------


router.post('/loginYouthData', async(req, res) => {

    phone = req.body.phone;
    password = req.body.password;    

    try {
        let data =  await User.findOne({$and : [{phone : {$eq : phone}}, {password : {$eq : password}}]});
        if(data){
          req.session.isAuth=true;
          req.session.mobile=phone;
          res.redirect('/haribol');
        }else{
            res.redirect('/')
        }
    } catch (error) {
        res.redirect('/')
    }
})
// -------------------------Mala Update------------------------


var beats = 0;
router.post('/chantingupdate', async (req, res) => {
    //console.log(req.body.counting);
    try{
        let chant = await User.findOne({phone : req.session.mobile});
        if(chant.count == 108){
            beats=0;
            mala = chant.mala_count + 1;
            await User.updateOne({phone : req.session.mobile}, {$set : {"count" : beats}})
            await User.updateOne({phone : req.session.mobile}, {$set : {"mala_count" : mala}})
        }
        else{
            beats = 0;
            beats = 1 + chant.count;
            await User.updateOne({phone : req.session.mobile}, {$set : {"count" : beats}})
        }
        res.send(chant)

    }catch(error){
        console.log('Error Occured' + error);
    }
})



module.exports = router;
