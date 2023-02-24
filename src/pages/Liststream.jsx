import { Button, Paper } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";


export default function Liststream(){
const [loading,setloading]=useState(false);
const [text,settext]=useState("");
const [list,setlist]=useState([]);
const [error,seterror]=useState(false);
const Navigate=useNavigate();
useEffect(()=>{

async function fetchList(){
    setloading(true);
    settext("");
    seterror(false);
    try {
        const res=await axios.get(process.env.REACT_APP_NODE+"/list");
        setlist(res.data.arr);
       // console.log(res.data.arr);
     } catch (error) {
      console.log(error);
      seterror(true);
      settext("server error");   
     }
     setloading(false);
}
fetchList();

},[]);
return (
<div className="w-screen h-screen m-2">
    {
        list.map((el)=>{
           // console.log(el);
            return (
                <div key={el.uid}>
           <Paper elivation={3} className="w-1/4 h-2/4">
    <img src="https://img.freepik.com/premium-vector/live-stream-logo-live-streaming-icon-live-broadcasting-button_349999-639.jpg" alt="banner live" className="animate-pulse" />
    <p className="text-gray-500 font-serif">{el.uid}</p>
    <Button variant="contained" onClick={()=>Navigate("/join/"+el.uid)} sx={{width:"100%"}}>JOIN</Button>
           </Paper>
           
                </div>
            )
        })
    }
</div>
);
}