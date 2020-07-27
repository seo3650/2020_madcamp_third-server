const cookieParser =  require('cookie-parser');
const morgan = require( 'morgan');
const path = require( 'path');
const helmet = require( 'helmet');

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
import { count } from 'console';
const server = http.createServer(app);
const io = socketIO(server);
server.listen(80, () => {
    console.log('connect 80');
  });



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




const namespace = io.of('/namespace');
namespace.on('connection',(socket)=>{

})
var rooms = [];


io.on('chatting',function(socket: any){
    socket.on('join:room',function(data : any){
        var room = data.room;
        // if(rooms[room] == undifined){

        // }

        // socket.set('nickname',nickname,function(){
        //     socket.emit('changename',{nickname:nickname});
        // })

        console.log('Message from Client: '+data);
        io.to(data['roomName']).emit('message',data);
        //io.emit('message',JSON.stringify(data));
    })
    socket.on('send:message',function(data : any){
        io.sockets.in('room'+data.roomId).emit('send:message',data.message);
    })

});


// Export express instance
export default app;
