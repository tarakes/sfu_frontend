
import { io } from "socket.io-client";
import { Device } from 'mediasoup-client';
import {useEffect,useRef,useState} from "react";
let device=new Device(),routerRtpCapabilities;
let socket=io("http://localhost:4000")
function Joinstream() {
   
   
   function getRouterCapabilities(){
    socket.emit('getRouterCapabilities',async (data)=>{
        routerRtpCapabilities=data;   
        await device.load({ routerRtpCapabilities });
        console.log('load get router cap')
       })
   }
   function createsendTransport(){
    
     socket.emit('createTransport', {issender : true},async ({ id, iceParameters, iceCandidates, dtlsParameters,sctpParameters})=>{
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

      socket.emit('transport-connect',{ issender : true,dtlsParameters},(error)=>{
        if(!error)
        callback();
        else
        errback(error);
      })
 
});
sendTransport.on(
    'produce',
    async ({ kind, rtpParameters, appData }, callback, errback) =>{
        socket.emit('produce',{  transportId : sendTransport.id,kind,rtpParameters, appData},({id,error})=>{
       if(!error)
       callback({id});
       else
       errback(error);
        })
    });
   /* sendTransport.on(
        'producedata',  async ({ sctpStreamParameters, label, protocol, appData }, callback, errback) =>{
            socket.emit('produceData',{ transportId : sendTransport.id,sctpStreamParameters,label,protocol,appData},({id,error})=>{
                if(!error)
                callback({id});
                else
                errback(error);
            })
        });  */
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
       // console.log(stream);
        document.getElementById("localvideo").srcObject=stream;
        const webcamTrack = stream.getVideoTracks()[0];
        const webcamProducer = await sendTransport.produce({ track: webcamTrack });
     }) 
   }
   function createrecvTransport(){
    
    socket.emit('createTransport', {issender : false},async ({ id, iceParameters, iceCandidates, dtlsParameters,sctpParameters})=>{
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

     socket.emit('transport-connect',{ issender : false,dtlsParameters},(error)=>{
       if(!error)
       callback();
       else
       errback(error);
     })

});

  socket.emit('create-consume',{rtpCapabilities: device.rtpCapabilities},async ({id,producerId,kind,rtpParameters})=>{
    const consumer = await recvTransport.consume({
        id,
        producerId,
        kind,
        rtpParameters
    });
    const { track } = consumer;

  document.getElementById("remotevideo").srcObject = new MediaStream([ track ]);
  socket.emit('resume-consumer');
  })
       
    }) 
  }
  return (
    <div className="App" style={{dislay:"flex"}}>
        <div>
            <video id="localvideo" style={{width:"300px",height:"300px"}} autoPlay></video>
        <button onClick={getRouterCapabilities}>getRouterCapabilities and load device</button>
        <button onClick={createsendTransport}>Create sendTransport and start stream</button>
        </div>
        <div>
            <video id="remotevideo" style={{width:"300px",height:"300px"}} autoPlay></video>
        <button onClick={getRouterCapabilities}>getRouterCapabilities and load device</button>
        <button onClick={createrecvTransport}>Create recvTransport and show stream</button>
        </div>
    </div>
  );
}

export default App;
