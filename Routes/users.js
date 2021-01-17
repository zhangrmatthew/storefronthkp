const jwt = require("jsonwebtoken");
const express = require('express');
const router = express.Router();
const userModel = require('../Models/usersSchema');
const bcrypt = require('bcrypt');
require('dotenv/config');
const saltRounds = 10;

router.post('/login', function(req, res){
    userModel.exists({ username: req.body.username },
      function(err, result){
        if(err){
          res.send(JSON.stringify({ErrorType: "Account Validation"}));
        }
        else{
          if (result){
            userModel.find({ username: req.body.username }, function(err, currAcc){
              if(err){
                res.send(JSON.stringify({ErrorType: "Finding Validation"}));
              }
              currAcc.forEach(function(acc){
                bcrypt.compare(req.body.password, acc.password, function(err, result) {
                  if (err){
                    res.send(JSON.stringify({ErrorType: "Decryption"}));
                  }
                  if(result){
                    const token = generateAccessToken({username : req.body.username,
                    isAdmin: req.body.isAdmin});
                    res.send(JSON.stringify({Message: 'Login Success', adminInfo : acc.isAdmin, token}));
                  }
                  else{
                    res.send(JSON.stringify({ErrorType: "Invalid Password"}));
                  }
                });
              });
            });
          }
          else{
            res.send(JSON.stringify({ErrorType: 'Account Does Not Exist'}));
          }
        }
      });
});


router.post('/create', function(req,res){
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    if (err) {
      res.send(JSON.stringify({ErrorType: "Hashing"}));
    }
    else{
      req.body.password = hash;
      const user = new userModel(req.body);
      userModel.exists({ username: req.body.username},
        function(err, result){
          if(err){
            res.send(JSON.stringify({ErrorType: "Username Validation"}));
          }
          else{
            if (result){
              res.send(JSON.stringify({ErrorType: 'Duplicate Username'}));
            }
            else{
              try{
                user.save();
                const token = generateAccessToken({username : req.body.username,
                isAdmin: req.body.isAdmin});
                res.send(JSON.stringify({Message: 'Account Creation Success', adminInfo : req.body.isAdmin, token}));
              }
              catch(err){
                res.send(JSON.stringify({ErrorType: "Creation"}));
              }
            }
          }
        });
    }
  });
});


function generateAccessToken(username) {
  // expires after a day (86400 seconds = 1 day )
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '86400s' });
}


module.exports = router;
