import * as React from 'react';
import TextField from '@mui/material/TextField';
import { useNavigate } from "react-router-dom"
export default function Home(){
    const Navigate=useNavigate();
    const [username,setusername]=React.useState(localStorage["username"]);
  
  function handleClick(link){
   if(!username){
    alert("Please enter display name");
    return;
   }
   localStorage.setItem("username",username);
   Navigate(link);
  }
      
    return(
        <div className="flex-col  m-auto translate-y-56 space-y-4">
           <TextField id="outlined-basic" label="Display name" variant="outlined" sx={{marginLeft:"45%"}} value={username} onChange={(e)=>setusername(e.target.value.trim())} />
    <button className="block  m-auto  rounded-lg scale-105 p-2 ring-2 font-serif 
    font-semibold text-white  bg-cyan-500 shadow-lg shadow-cyan-500/50" onClick={()=>handleClick("/createstream")}>Start stream</button>
    <button className="block  m-auto  rounded-lg scale-105 p-2 ring-2 font-serif
     font-semibold text-white  bg-blue-500 shadow-lg shadow-blue-500/50" onClick={()=>handleClick("/live")}>join a stream</button>
  </div>
    )
}