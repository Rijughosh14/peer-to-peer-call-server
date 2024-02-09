const Express=require('express')
const app=Express()
const cors=require('cors')
const dotenv=require('dotenv').config()
const { createServer } = require("http");
const { Server } = require("socket.io");


//cors  config
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

const httpServer=createServer(app)

const Users=new Map()

const io=new Server(httpServer,{
    cors: {
        origin:process.env.CLIENT_URL,
        credentials: true
      }
})

io.on('connection',(socket)=>{
  socket.on('registerUser',(number)=>{
    Users.set(number,socket.id)
  })

  socket.on('call-made',(fid,cid)=>{
    const socketid=Users.get(fid)
    socket.to(socketid).emit('incomingCall',cid,fid)
  })

  socket.on('signal',(data)=>{
    const{SignalingData,Callid,callerid}=data
    const socketid=Users.get(Callid)
    socket.to(socketid).emit('signal',SignalingData,callerid)
  })

  socket.on('disconnection',(id)=>{
    const socketid=Users.get(id)
    socket.to(socketid).emit('disconnectionevent')
  })

  socket.on('offline',(id)=>{
    Users.delete(id)
  })
})
httpServer.listen(process.env.port)
