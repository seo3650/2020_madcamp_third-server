import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';

import express, { Request, Response, NextFunction } from 'express';
import { BAD_REQUEST } from 'http-status-codes';
import 'express-async-errors';

import BaseRouter from './routes';
import logger from '@shared/Logger';



//import http from 'http'
//import io from 'socket.io'

//import $ from 'jquery'
//import * as http from "http";
//import * as socketIO from "socket.io";

const mongoose = require('mongoose');
require('dotenv').config();
require('source-map-support').install();

// Init express
const app = express();

mongoose.connect("mongodb+srv://seo:sparcs@cluster0.onq1r.gcp.mongodb.net/dating?retryWrites=true&w=majority", 
  { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', function(error: any) {
  console.error("Connection error;", error);
});
db.once('open', function(){
  console.log("Connected to mongod server");
});

process.on('unhandledRejection', console.log);

/******for socket */

import http from 'http';
import socketIO from 'socket.io';
const server = http.createServer(app);
const io = socketIO(server);

// var server = require('http').createServer(app);
// var io = require('socket.io')(server);


/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Security
if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
}

// Add APIs
app.use('/api', BaseRouter);

// Print API errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message, err);
    return res.status(BAD_REQUEST).json({
        error: err.message,
    });
});



/************************************************************************************
 *                              Serve front-end content
 ***********************************************************************************/

const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);

const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));
app.get('*', (req: Request, res: Response) => {
    res.sendFile('index.html', {root: viewsDir});
});

io.on('chat message',function(socket: any){
    socket.on('event_name',function(data : any){
        console.log('Message from Client: '+data);
        io.to(data['roomName']).emit('message',data);
        //io.emit('message',JSON.stringify(data));
    })
});


// Export express instance
export default app;
