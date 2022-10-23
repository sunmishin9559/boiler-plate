const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');

const { User } = require('./models/User');

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose');
mongoose.connect(config.mongoURI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log('err'));

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.post('/register', (req, res) => {
  // Save account information from client to DB
  const user = new User(req.body);
  user.save((err, userInfo) => {
    if(err) return res.json({success: false, err})
    return res.status(200).json({
      success: true
    })
  })
});

app.post('/login', (req, res) => {
  //Check if user information exists
  User.findOne({email: req.body.email}, (err, userInfo) => {
    if(!userInfo) {
      return res.json({
        loginSuccess: false,
        message: "No User Inforamtion Found."
      })
    }

    //Check password validation
    userInfo.validPassword(req.body.password, (err, isMatch) => {
      if(!isMatch) {
        return res.json({
          loginSuccess: false,
          message: "Invalid Password"
        })
      }

      //Generate token
      userInfo.generateToken((err, userInfo) => {
        if(err) return res.status(400).send(err);

        //Save token on Cookie
        res.cookie("x_auth", userInfo.token)
        .status(200)
        .json({
          loginSuccess: true,
          userId: userInfo._id
        })
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});