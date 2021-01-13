const express = require('express');
const server = express();
const mongoose = require('mongoose');
const usersRouter = require('./Routes/users');
const itemsRouter = require('./Routes/items');
require('dotenv/config');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

server.use(express.json());

server.use('/users', usersRouter);
server.use('/items', itemsRouter);


mongoose.connect(process.env.DB_CONNECTION,
  () => console.log('connected to DB'));

const PORT = process.env.PORT || 3000;
server.listen(PORT);
