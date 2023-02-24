import * as React from 'react';
import { io } from "socket.io-client";
import { Device } from 'mediasoup-client';
import {useEffect, useState} from "react";
import { Button, Paper } from "@mui/material";
import TextField from '@mui/material/TextField';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import { useNavigate } from 'react-router-dom';
let device=new Device(),routerRtpCapabilities;
let socket=io(process.env.REACT_APP_NODE);
function Startstream({uid}) {
  const [loading,setloading]=useState(false);
  const [arr,setarr]=useState([]);
    const [text,settext]=useState();
    const [username,setusername]=useState(localStorage["username"]);
    const Navigate=useNavigate();
  useEffect(()=>{
async function x(){
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  // console.log(stream);
   document.getElementById("localvideo").srcObject=stream;
}
x();
  },[])
  useEffect(()=>{
    setloading(true);
   if(uid){
    
    getRouterCapabilities(uid);
    setTimeout(() => {
       createsendTransport(uid);
       setloading(false);
    }, 1000); 
    
   } 
   },[uid])
useEffect(()=>{
  socket.emit("join",uid);
  socket.on("msg",(data)=>{
    setarr(prev=>[...prev,data]);
  })
},[])
  function getRouterCapabilities(uid){
    socket.emit('getRouterCapabilities',uid,async (data)=>{
        routerRtpCapabilities=data;   
        await device.load({ routerRtpCapabilities });
        console.log('load get router cap')
       })
   }
   function createsendTransport(uid){
    
     socket.emit('createTransport', {issender : true,uid,useruid:uid},async ({ id, iceParameters, iceCandidates, dtlsParameters,sctpParameters})=>{
        const sendTransport = device.createSendTransport(
            {
              id, 
              iceParameters, 
              iceCandidates, 
              dtlsParameters,
              sctpParameters
            });
            sendTransport.on('connect', async ({ dtlsParameters }, callback, errback) =>
{

      socket.emit('transport-connect',{ issender : true,dtlsParameters,uid},(error)=>{
        if(!error)
        callback();
        else
        errback(error);
      })
 
});
sendTransport.on(
    'produce',
    async ({ kind, rtpParameters, appData }, callback, errback) =>{
        socket.emit('produce',{  transportId : sendTransport.id,kind,rtpParameters, appData,uid},({id,error})=>{
       if(!error)
       callback({id});
       else
       errback(error);
        })
    });
   sendTransport.on(
        'producedata',  async ({ sctpStreamParameters, label, protocol, appData }, callback, errback) =>{
            socket.emit('produceData',{ transportId : sendTransport.id,sctpStreamParameters,label,protocol,appData},({id,error})=>{
                if(!error)
                callback({id});
                else
                errback(error);
            })
        });  
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
       // console.log(stream);
        document.getElementById("localvideo").srcObject=stream;
        const webcamTrack = stream.getVideoTracks()[0];
        const webcamProducer = await sendTransport.produce({ track: webcamTrack });
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
  function endStream(){
    window.confirm("end stream?");
    socket.emit("leave",uid);
    socket.emit("endstream",uid);
  Navigate("/");
  }
  return (
    <Box sx={{display:"flex",margin:"1%"}} >

        <Box >
          {loading && <p>Loading...</p>}
          <Button onClick={()=>endStream()}>End stream</Button>
            <video id="localvideo" autoPlay className="ring-4 w-auto h-auto rounded-lg"></video>
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

export default Startstream;
