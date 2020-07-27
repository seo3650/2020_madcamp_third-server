/* socket\namespace\app.js */

const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const jQuery = require('jQuery');
server.listen(80, () => {
  console.log('connect 80');
});
//const jQuery = require(jQuery);
// jQuery(function(data : any){
//     var socket = io.connect('http://localhost');
// })

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

// app.get('/', (req:any, res:any) => {
//   res.sendFile(__dirname + '/index.html');
// });
// // NameSpace 1번
// const namespace1 = io.of('/namespace1');
// // connection을 받으면, news 이벤트에 hello 객체를 담아 보낸다
// namespace1.on('connection', (socket:any) => {
//   namespace1.emit('news', { hello: 'Someone connected at namespace1' });
// });
// // NameSpace 2번
// const namespace2 = io.of('/namespace2');
// // connection을 받으면, news 이벤트에 hello 객체를 담아 보낸다
// namespace2.on('connection', (socket:any) => {
//   namespace2.emit('news', { hello: 'Someone connected at Namespace2' });
// });