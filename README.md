# storefronthkp
# Storefront API Documentation

## User Service

### Account Creation
`POST /users/create`

Expected input
```
Raw JSON

{
"username": "sampleUsername",
"password": "samplePassword",
"isAdmin": false
}
```
Outputs
```
Raw JSON

Success:
{
"Message": "Account Creation Success",
"token": "JWTtoken"
}

Errors:

{
"ErrorType": "description"
}

```

### Account Login
```
POST /users/login
```
Expected input
```
Raw JSON

{
"username": "sampleUsername",
"password": "samplePassword",
"isAdmin": false
}
```
Outputs
```
Raw JSON

Success:
{
"Message": "Account Login Success",
"token": "JWTtoken"
"isAdmin": Boolean
}

Errors:

{
"ErrorType": "description"
}

```
## Item Service

### Add Item
```
PUT /items/upload
```
Expected Input
```
JWT Token in authorization header (Bearer Token)
form-data

Key                Value
name               Text
price              Text
description        Text
photos             Attached files

Within Form:
<input type="file" name="photos" />

```

Outputs
```
Raw JSON 

Success:
{
"item":{"photos":[Strings],
"_id": String,
"name": String,
"price": Integer,
"description": String,
"__v": Number}
}

Errors:

{
"ErrorType": "description"
}
```
### Remove Item
```
DELETE items/remove
```
Expected Input
```
JWT Token in authorization header (Bearer Token)
Raw JSON

{
"_id" : "database id"
}

```
Outputs
```
Raw JSON 

Success:
{
"removed":
{"photos":["relative path(s)"],
"_id":"String",
"name":"String",
"price": Integer,
"description":"String",
"__v":Integer}
}

Errors:

{
"ErrorType": "description"
}
```

### Get All Items
```
GET /items/get/all
```
Expected Input
```
JWT Token in authorization header (Bearer Token)
```
Outputs
```
Success:
{
"allItems":
[
{
"photos" : [String(s)],
"_id" : "String",
"name" : "String",
"price" : Integer,
"description" : "String",
"catagory" : "String",
"__v": Integer
}
etc.
]
}

Errors:

{
"ErrorType": "description"
}
```

### Get Items By Category
```
GET /items/get/category
```
Expected Input
```
JWT Token in authorization header (Bearer Token)
Raw JSON

{
"category" : "String"
}
```
Outputs
```
Success:
{
"allItems":
[
{
"photos" : [String(s)],
"_id" : "String",
"name" : "String",
"price" : Integer,
"description" : "String",
"category" : "String",
"__v": Integer
}
etc.
]
}

Errors:

{
"ErrorType": "description"
}
```

## Cart Service

### Creating/Adding/Removing From Cart
```
PUT /cart/addItem
```
Expected Input
```
JWT Token in authorization header (Bearer Token)
Raw JSON
{
    "_id" : "String",
    "quantity" : Number,
    "removeItem" : Boolean
}

"_id" is the item's unique id that was created when adding to items database

"quantity" increments amount of an item (or decrements if input is negative), 
once item's total quantity in cart is <= 0 it gets removed

"removeItem", sest as true to remove the entire item regardless of quantity, set as false to 
not do so

```
Expected Output

```
Success:
{
"newCart":{"_id":"String","username":"String",
"cart":[{"_id":"String","item":"String","price":Number,"quantity":Number}, 
        etc...]
}

"item" is the item's unique id that was created when adding to items database

Errors:

{
"ErrorType": "description"
}
```

### Fetching All Items From Cart
Note: the cart is only instantiated when an user adds a item to the cart. If all items are removed the cart will still exist. But the cart will not exist prior to any action from the user interacting with the cart. 

```
GET /cart/view
```
Expected Input
```
JWT Token in authorization header (Bearer Token)
```
Expected Output
```
Success:
{
"newCart":{"_id":"String","username":"String",
"cart":[{"_id":"String","item":"String","price":Number,"quantity":Number}, 
        etc...]
}

"item" is the item's unique id that was created when adding to items database

Errors:

{
"ErrorType": "description"
}
```

### Checkout

```
GET /cart/checkout
```
Expected Input
```
JWT Token in authorization header (Bearer Token)
```
Expected Output
```
Success:
{
"oldCart":{"_id":"String","username":"String",
"cart":[{"_id":"String","item":"String","price":Number,"quantity":Number}, 
        etc...]
}

"item" is the item's unique id that was created when adding to items database
This cart is the version right before checkout, after checkout everything in "cart" gets cleared.

Errors:

{
"ErrorType": "description"
}
```
