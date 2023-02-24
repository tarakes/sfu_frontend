import { Alert, Button } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react"
import Startstream from "../components/startstream";
import { v4 as uuidv4 } from 'uuid';
export default function Createstream(){
    const [error,seterror]=useState(false);
    const [loading,setloading]=useState(false);
    const [text,settext]=useState("");
    const [startstream,setstartstream]=useState(false);
    const [uid,setuid]=useState();
    useEffect(()=>{
    
   async function checkCamera(){
    setloading(true);
    settext("");
    seterror(false);
    try {
    const stream=  await navigator.mediaDevices.getUserMedia({ video: true,audio:false,width:"300px",height:"300px" });
    document.getElementById("testvideo").srcObject=stream;
    setuid(uuidv4());
    } catch (error) {
      console.log(error);
      settext("unable to start camera")
      seterror(true);  
    }

    setloading(false);
   }
  
   checkCamera();
    },[])
    if(!startstream)
    return(
        <div className="m-auto  text-center translate-y-36  ">
         
            <video autoPlay id="testvideo" width="500px" height="500px" className="bg-white border-2 border-blue-500 m-auto shadow-lg shadow-white-500/50 rounded-lg ring-2 mb-2"></video>
       {error &&   <Alert severity="error"  className="m-auto w-1/4">{text}</Alert>}
         <Button disabled={error} variant="contained" onClick={()=>setstartstream(true)} >Start</Button>
        </div>
    )
    else// if(!loading && startstream)
    return(
    <Startstream uid={uid} />
    );
   
}