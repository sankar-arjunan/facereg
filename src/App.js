// src/App.js

import React, { useEffect, useState } from 'react';
import CameraCapture from './components/CameraCapture';

function App() {
  const [type, setType] = useState("");
  const [url,setUrl] = useState("");

  async function getDynamicUrl() {
    try {
        const response = await fetch('https://sanhector.pythonanywhere.com/');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setUrl(data.url);  
    } catch (error) {
        console.error('Error fetching dynamic URL:', error);
        return null;
    }
  }

  useEffect(()=>{
    getDynamicUrl();
  },[])


  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    } catch (err) {
      console.log('Failed to access camera');
    }
  };
  return (
    <div className="App" style={{height:"100vh", }}>
      <div style={{background:"black", color:"white"}}>
        <h1 style={{textAlign:"center", background:"black", color:"white", padding:"48px 0 0 0 "}}>Biometric System</h1>
        <div style={{fontSize:"16px", padding:"0 0 48px 0", textAlign:"center"}}>built by GyRO</div>
      </div>
      {(type=="")  &&  <div style={{display:"flex", flexDirection:"column", gap:"24px", padding:"20px", fontSize:"24px", alignItems:"center"}}>
        <p>Choose the action :</p>
        <button onClick={() => setType("Auth")} style={{border:"1px solid transparent", color:"white", background:"green", padding:"16px 32px", width:"100%", fontSize:"24px"}}>Authenticate</button>
        <button onClick={() => setType("Register")} style={{border:"1px solid green", color:"green", background:"white", padding:"16px 32px", width:"100%", fontSize:"24px"}}>Register face</button>
      </div>}
      {(type=="Auth" || type=="Register")  &&  <CameraCapture type={type} setType={setType} url={url}/> }
    </div>
  );
}

export default App;
