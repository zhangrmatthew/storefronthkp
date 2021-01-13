const jwt = require("jsonwebtoken");
const express = require('express');
const router = express.Router();
const itemModel = require('../Models/itemsSchema');
require('dotenv/config');


router.put('/create', authenticateToken, function(req, res){
  const newItem = new itemModel({username: req.user.username, name: req.body.name
    , quantity: req.body.quantity});
  itemModel.exists({ username: req.user.username, name: req.body.name},
    function(err, result){
      if(err){
        res.send("ErrorType: Item Addition");
      }
      else{
        if (result){
          itemModel.findOneAndUpdate({ username: req.user.username, name: req.body.name},
          {$inc: {quantity: req.body.quantity} }, {new: true},
          function(err,result){
            if (err){
              res.send("ErrorType: Updating");
            }else{
              res.send(JSON.stringify({result}));
            }
          });
        }
        else{
          try{
            newItem.save(function (err, item){
              res.send(item);
            });
          }
          catch(err){
            res.send("ErrorType: Add Item");
          }
        };
      }
  });
});


router.get('/get/:token', authenticateTokenURL, function(req, res){
  var items = [];
  itemModel.exists({ username: req.user.username},
    function(err, result){
      if(err){
        res.send("ErrorType: Cart Validation");
      }
      else{
        if (result){
          itemModel.find({username: req.user.username}, function (err, docs) {
            docs.forEach(function(doc){
                items.push(doc.name);
            });
            res.send(items);
          });
        }
        else{
          res.send('ErrorType: Cart is Empty');
        }
      }
    });
});


router.delete('/remove', authenticateToken, function(req,res){
  itemModel.findByIdAndDelete(req.body._id, function(err, removed){
    if(err){
      res.send("ErrorType: Deletion");
    }
    else{
      console.log(removed);
      res.send(removed);
    }

  });
});

function authenticateToken(req, res, next) {
  const token = req.body.token;
  if (token == null) return res.sendStatus(401)
  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    console.log(err);
    if (err) return res.sendStatus(403);
    req.user = decoded;
    next();
  })
}

function authenticateTokenURL(req, res, next) {
  const token = req.params.token;
  console.log(token);
  if (token == null) return res.sendStatus(401)
  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    console.log(err);
    if (err) return res.sendStatus(403);
    req.user = decoded;
    next();
  })
}

module.exports = router;
