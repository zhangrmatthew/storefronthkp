const jwt = require("jsonwebtoken");
const express = require('express');
const router = express.Router();
const cartModel = require('../Models/cartSchema');
const itemModel = require('../Models/itemsSchema');
require('dotenv/config');

//add or remove items to cart, incl. cart creation
router.put('/addItem', authenticateToken, function(req, res){
  itemModel.exists({_id : req.body._id}, function(err, result){
    if (err){
      res.send(JSON.stringify({ErrorType: "Item does not exist"}));
    }
    else{
      itemModel.findById(req.body._id, function (err, item) {
        if(err){
          res.send(JSON.stringify({ErrorType: "Finding Item"}));
        }
        else{
          //console.log(item);
          cartModel.exists({ username: req.user.username }, function(err,result){
            if(err){
              res.send(JSON.stringify({ErrorType: "Cart Existance"}));
            }
            if (result){
              cartModel.findOne({ username: req.user.username },  function(err, currCart){
                  if (err){
                    res.send(JSON.stringify({ErrorType: "Finding Cart"}));
                  }
                  else{ //expects to update collection with new document using mimic
                    //console.log(currCart);
                    var itemQuantity = req.body.quantity;
                    var mimic = [];
                    var notSeen = true;
                    currCart.cart.forEach(function(object){
                      if (object.item == item._id){
                        if (req.body.removeItem){
                          return;
                        }
                        itemQuantity += object.quantity;
                        if (itemQuantity <= 0){
                          req.body.removeItem = true;
                          return;
                        }
                        mimic.push({item: item._id, price: object.price, quantity: itemQuantity});
                        notSeen = false;
                      }
                      else{
                        mimic.push(object);
                      }
                      console.log(mimic);
                    });

                    //if notSeen then we add the current item to mimic, only time it is seen is when we update the values
                    //ie its in our cart already so we process it, otherwise we need to individually add it to cart
                    if (notSeen && !req.body.removeItem){
                      mimic.push({item: item._id, price: item.price, quantity: req.body.quantity});
                    }
                    const newCart = new cartModel({username: req.user.username, cart: mimic});
                    cartModel.findOneAndDelete({username: req.user.username }, function (err, docs) {
                      if (err){
                          res.send(JSON.stringify({ErrorType: "Removal Failure"}));
                      }
                      else{
                        try{
                          newCart.save(function (err, newCart){
                            res.send(JSON.stringify({newCart}));
                          });
                        }
                        catch(err){
                          res.send(JSON.stringify({ErrorType: "Add Item"}));
                        }
                      }
                    });
                  }
              });
            }
            else{
              const newCart = new cartModel({username: req.user.username, cart:
                [{item: item._id , price: item.price , quantity: Math.max(0, req.body.quantity)}]});
                console.log(newCart);
                try{
                  newCart.save(function (err, newCart){
                    res.send(JSON.stringify({newCart}));
                  });
                }
                catch(err){
                  res.send(JSON.stringify({ErrorType: "Add New Cart"}));
                }
            }

          });

        }
      });
    }
  });

});


//view all items in cart
router.get('/view', authenticateToken, function(req, res){
  var items = [];
  cartModel.exists({ username: req.user.username},
    function(err, result){
      if(err){
        //user has not yet added anything to cart, so nothing to look at
        res.send(JSON.stringify({ErrorType: "Cart Existance"}));
      }
      if(result){
        cartModel.findOne({username: req.user.username}, function (err, currCart) {
            currCart.cart.forEach(function(object){
              items.push(object);
            });
            res.send(JSON.stringify({items}));
        });
      }
      else{
        res.send(JSON.stringify({ErrorType: "Personal Cart Existance"}));
      }

    });
  });

//checkout
router.delete('/checkout', authenticateToken, function(req,res){
  cartModel.exists({ username: req.user.username},
    function(err, result){
      if(err){
        //user has not yet added anything to cart, so nothing to look at
        res.send(JSON.stringify({ErrorType: "Cart Existance"}));
      }
      if(result){
        cartModel.findOneAndUpdate({username: req.user.username}, {$set: {cart : []}},
          function (err, oldCart) {
          if(err){
            res.send(JSON.stringify({ErrorType: "Cannot Find Specific Cart"}));
          }
          else{
            res.send(JSON.stringify({oldCart}));
          }
        });
      }
      else{
        res.send(JSON.stringify({ErrorType: "Personal Cart Existance"}));
      }
  });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)
  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    console.log(err);
    if (err) return res.sendStatus(403);
    req.user = decoded;
    next();
  })
}
module.exports = router;
