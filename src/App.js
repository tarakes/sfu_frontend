import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Createstream from "./pages/Createstream";
import Liststream  from "./pages/Liststream";
import Joinstream from "./pages/Joinstream";
export default function App(){
return(
<div className="h-screen w-screen  bg-gray-100  m-auto">
<BrowserRouter>
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/createstream" element={<Createstream />} />
          <Route path="/live" element={<Liststream /> } />
          <Route path="/join/:uid" element={<Joinstream />}  />
      </Routes>
      </BrowserRouter>
      </div>
);
}