const jwt = require("jsonwebtoken");
const express = require('express');
const router = express.Router();
const itemModel = require('../Models/itemsSchema');
const multer  = require('multer');
const upload = multer({ dest: 'Temp/' });
const fs = require('fs');
const path = require('path');
require('dotenv/config');

router.put('/upload', authenticateTokenAdmin, upload.array('photos', 10), function (req, res, next) {
// req.files is array of `photos` files
// req.body will contain the text fields, if there were any

  var uploadedPics = [];
  req.files.forEach(function(file){
      uploadedPics.push(file.filename);
  })

  const newItem = new itemModel({name: req.body.name, price: req.body.price, description: req.body.description
  , catagory: req.body.catagory, photos: uploadedPics});

  itemModel.exists({name: req.body.name},
    function(err, result){
      if(err){
        res.send(JSON.stringify({ErrorType : "Item Addition"}));
      }
      else{
        if (result){
          itemModel.findOneAndUpdate({name: req.body.name},
          {$set: {price: req.body.price, description: req.body.description
          , catagory: req.body.catagory, photos: uploadedPics} }, {new: true},
          function(err,result){
            if (err){
              res.send(JSON.stringify({ErrorType : "Updating"}));
            }else{
              res.send(JSON.stringify({result}));
            }
          });
        }
        else{
          try{
            newItem.save(function (err, item){
              res.send(JSON.stringify({item}));
            });
          }
          catch(err){
            res.send(JSON.stringify({ErrorType : "Add Item"}));
          }
        }
      }
  });
});

router.get('/get/category', authenticateTokenAdmin, function(req, res){
  var itemsInCategory = [];
  itemModel.exists({ category: req.body.category},
    function(err, result){
      if(err){
        res.send(JSON.stringify({ErrorType : "Category Validation"}));
      }
      else{
        if (result){
          itemModel.find({category: req.body.category}, function (err, docs) {
            docs.forEach(function(doc){
                itemsInCategory.push(doc);
            });
            //avoid cubic behavior within other for loop - try to get time comp down later
            itemsInCategory.forEach(function(item) {
              sanitizedPaths = [];
              item.photos.forEach(function(relational){
                newPath = path.join(__dirname, "..", "Temp", relational);
                sanitizedPaths.push(newPath);
              });
              item.photos = sanitizedPaths;
            });
            res.send(JSON.stringify({itemsInCategory}));
          });
        }
        else{
          res.send(JSON.stringify({ErrorType: 'Cannot find all'}));
        }
      }
    });
});





router.get('/get/all', authenticateTokenAdmin, function(req, res){
  var allItems = [];
  itemModel.exists({},
    function(err, result){
      if(err){
        res.send(JSON.stringify({ErrorType : "All Validation"}));
      }
      else{
        if (result){
          itemModel.find({}, function (err, docs) {
            docs.forEach(function(doc){
                allItems.push(doc);
            });
            //avoid cubic behavior within other for loop - try to get time comp down later
            allItems.forEach(function(item) {
              sanitizedPaths = [];
              console.log(item.photos);
              item.photos.forEach(function(relational){
                console.log(sanitizedPaths);
                newPath = path.join(__dirname, "..", "Temp", relational);
                console.log(newPath);
                sanitizedPaths.push(newPath);
              });
              item.photos = sanitizedPaths;
            });
            res.send(JSON.stringify({allItems}));
          });
        }
        else{
          res.send(JSON.stringify({ErrorType: 'Cannot find all'}));
        }
      }
    });
});


router.delete('/remove', authenticateTokenAdmin, function(req,res){
  console.log(req.body);
  itemModel.findById(req.body._id, function (err, item) {
    if(err){
      res.send(JSON.stringify({ErrorType: "Finding During Deletion"}));
    }
    else{
      console.log(item);
      item.photos.forEach(function(filename){
        fs.unlink(path.join(__dirname, "..", "Temp", filename.toString())
       ,(err) => {
          if (err) {
              //does this avoid sending multiple res to server
              res.send(JSON.stringify({ErrorType: "Unlinking Photos"}));
              return;
          }
        });
      });
    }
  });

  itemModel.findByIdAndDelete(req.body._id, function(err, removed){
    if(err){
      res.send(JSON.stringify({ErrorType: "Database Deletion"}));
    }
    else{
      res.send(JSON.stringify({removed}));
    }
  });
});



function authenticateTokenAdmin(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)
  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    console.log(err);
    if (err) return res.sendStatus(403);
    req.user = decoded;
    if (!req.user.isAdmin) return res.send(403);
    next();
  });
}
module.exports = router;
