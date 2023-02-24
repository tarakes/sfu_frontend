import { useNavigate, useParams } from "react-router-dom";
import * as React from 'react';
import { io } from "socket.io-client";
import { Device } from 'mediasoup-client';
import { useEffect, useState } from "react";
import { Button, Paper } from "@mui/material";
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import { v4 as uuidv4 } from 'uuid';
let device=new Device(),routerRtpCapabilities;
let socket=io(process.env.REACT_APP_NODE);

export default function Joinstream(){
    const {uid}=useParams();
    const [useruid,setuseruid]=useState();
    const [arr,setarr]=useState([]);
    const [text,settext]=useState();
    const [username,setusername]=useState(localStorage["username"]);
    const Navigate=useNavigate();
   useEffect(()=>{
      setuseruid(uuidv4());
      socket.emit("join",uid);
      socket.on("msg",(data)=>{
        setarr(prev=>[...prev,data]);
      })
      socket.on("endstream",()=>{
        window.alert("This stream has been ended");
        Navigate("/");
      })
    },[])
useEffect(()=>{
if(uid && useruid){
    getRouterCapabilities(uid);
    console.log(uid);
setTimeout(() => {
    createrecvTransport(uid,useruid);
}, 1000);
}
},[uid,useruid])
     
  
   function getRouterCapabilities(uid){
    socket.emit('getRouterCapabilities',uid,async (data)=>{
        routerRtpCapabilities=data;   
        await device.load({ routerRtpCapabilities });
        console.log('load get router cap')
       })
   }
   function createrecvTransport(uid,useruid){
    
    socket.emit('createTransport', {issender : false,uid,useruid},async ({ id, iceParameters, iceCandidates, dtlsParameters,sctpParameters})=>{
       const recvTransport = device.createRecvTransport(
           {
             id, 
             iceParameters, 
             iceCandidates, 
             dtlsParameters,
             sctpParameters
           });
           recvTransport.on('connect', async ({ dtlsParameters }, callback, errback) =>
{

     socket.emit('transport-connect',{ issender : false,dtlsParameters,uid:useruid},(error)=>{
       if(!error)
       callback();
       else
       errback(error);
     })

});

  socket.emit('create-consume',{rtpCapabilities: device.rtpCapabilities,uid,useruid},async ({id,producerId,kind,rtpParameters})=>{
    const consumer = await recvTransport.consume({
        id,
        producerId,
        kind,
        rtpParameters
    });
    const { track } = consumer;

  document.getElementById("remotevideo").srcObject = new MediaStream([ track ]);
  socket.emit('resume-consumer',useruid);
  })
       
    }) 
  }
function sendMessage(){
  if(!text)
  return;
  if(text.trim()==="")
  return;
  socket.emit("msg",text,uid,username);
setarr(prev=>[...prev,{name:"YOU",text}]);
}
function leaveStream(){
  window.confirm("leave stream?");
  socket.emit("leave",useruid);
Navigate("/");
}
  return (
    <Box sx={{display:"flex",margin:"1%"}} >

        <Box >
          <Button onClick={()=>leaveStream()}>Leave</Button>
            <video id="remotevideo" autoPlay className="ring-4 w-auto h-auto rounded-lg"></video>
   <LiveTvIcon sx={{marginTop:"-10%",scale:'1.5',marginLeft:"1%",fill:"red"}} className="animate-pulse"/>
        </Box>
      
        <Box sx={{marginLeft:"5%"}}>
         <Paper elivation={3} sx={{width:"500px",height:"500px",overflow:"scroll"}}>
      {
        arr.map((el)=>{
          return(
          <Box key={el.name} sx={{display:"flex",borderBottom:"0.5px solid gray"}} className="mt-1 font-serif border-bottom-2 border-blue-100">
          <Box sx={{display:"flex",flexDirection:"column"}}>

         <Avatar alt="Remy Sharp"  />
         
          <p className='text-gray-300 '>{el.name}</p>
          </Box>
            <span className='text-gray-500 mt-1'>{el.text}</span>
          </Box>
          )
        })
      }
         </Paper>
         <TextField id="outlined-basic" label="Enter text" variant="outlined" sx={{marginTop:"1%"}} value={text} onChange={(e)=>settext(e.target.value)} />
         <Button variant="contained" sx={{marginTop:"1%",marginLeft:"1%"}} onClick={()=>sendMessage()}>Send</Button>
        </Box> 
      
    </Box>
  );
}