import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const CameraCapture = ({ type, setType, url }) => {

  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [name, setName] = useState('');
  const [authResult, setAuthResult] = useState(null);
  const [detectionProbability, setDetectionProbability] = useState(0.0);



  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    setDetectionProbability(0);
  }, [webcamRef]);

  const handleRegister = async () => {
    if (!image || !name) {
      alert('Please capture an image and provide a name.');
      return;
    }

    const formData = new FormData();
    formData.append('file', dataURLtoFile(image, 'captured-image.jpg'));
    formData.append('name', name);

    try {
      await axios.post(url+'/register_face', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Face registered successfully!');
      setType("");
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error registering face.');
    }
  };

  const handleAuthenticate = async () => {
    if (!image) {
      alert('Please capture an image.');
      return;
    }

    const formData = new FormData();
    formData.append('file', dataURLtoFile(image, 'captured-image.jpg'));

    try {
      const response = await axios.post(url + '/authenticate_face', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.status === 200 ) {
        setAuthResult(response.data);
      } else {
        const errorMessage = response.data?.error || 'An error occurred while authenticating the face.';
        alert(errorMessage);
      }
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data?.error || 'An error occurred while authenticating the face.';
        if(errorMessage==="Attendace already marked"){ setType("");}
        alert(errorMessage);
      } else if (error.request) {
        alert('No response received from the server.');
      } else {
        alert('Error in the request setup.');
      }
    }
    
  };

  const checkFaceDetection = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      const formData = new FormData();
      formData.append('file', dataURLtoFile(imageSrc, 'live-image.jpg'));
      
      try {
        const response = await axios.post(url+'/check_face_detection', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setDetectionProbability(response.data.probability);
      } catch (error) {
        setDetectionProbability(0);
      }
    }
  };

  useEffect(() => {
    let interval;
    if ((type === 'Auth' || type==="Register")&& !image) {
      interval = setInterval(checkFaceDetection, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [type, image, checkFaceDetection]);

  const dataURLtoFile = (dataURL, filename) => {
    const [header, data] = dataURL.split(',');
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(data);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new File([new Uint8Array(array)], filename, { type: mime });
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(url+`/delete?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        alert("Attendance response removed");
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while deleting the record.');
    }
    finally{
      setType("");
    }
  };


  return (
    <div>
      {!image && <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={360} 
        height={360} 
        style={{  transform: 'scaleX(-1)', padding: '24px' }}
      />}
      {!image && !authResult && <div style={{padding:"0 24px 24px 24px"}}>
                <h2 style={{textAlign:"center"}}>Face Detection Quality:</h2>
                <h2 style={{textAlign:"center", color:detectionProbability === 0 ? "red" :detectionProbability*100 > 95 ? "green": "orange"}}>{detectionProbability === 0 ? "No face detected" :detectionProbability*100 > 95 ? "Excellent": "Better image needed"}</h2>
                </div>}
      {!image && <button onClick={detectionProbability*100 > 95 ? capture : ()=>{}} style={{border:"1px solid transparent", color:"white", background: detectionProbability*100 > 95 ? "green": "grey", padding:"16px 32px", width:"100%", fontSize:"24px"}}>{detectionProbability*100 > 95 ? "Capture" : "Make face visible"}</button>}

      {image && !authResult &&  (
        <> <h3 style={{textAlign:"center", padding:"24px 0 0 0"}}>Captured image</h3>
          <img src={image} alt="Captured" style={{ padding: '24px 0 ' }} />
          {type === 'Auth' && (
            <div style={{display:"flex", flexDirection:"column", gap:"24px", alignItems:"center"}}>
              <button onClick={handleAuthenticate} style={{border:"1px solid transparent", color:"white", background:"green", padding:"16px 32px", width:"80%", fontSize:"24px"}}>Authenticate</button>
              <button onClick={() =>{ setImage(null); setAuthResult(null)}}  style={{border:"1px solid green", color:"green", background:"white", padding:"16px 32px", width:"80%", fontSize:"24px"}}>Retake</button>
            </div>
          )}

          {type === 'Register' && (
            <div style={{padding:"12px",minWidth:"96px", display:"flex", flexDirection:"column", alignItems:"center"}}>
              <input
                type="text"
                placeholder="Enter rollno"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{fontSize:"24px", background:"white",border:"1px solid grey", padding:"12px 24px", borderRadius:"4px", width:"80%"}}
              />
              <button onClick={handleRegister} style={{border:"1px solid green", color:"white", background:"green", padding:"16px 32px", width:"80%", fontSize:"24px", marginTop:"24px"}}>Register</button>
            </div>
          )}
        </>
      )}

      {authResult && type === 'Auth' && (
        <>
          <div style={{display:"flex", flexDirection:"column", alignItems:"center",gap:"96px", padding:"24px"}}>
            <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
              <h2 style={{color:"black", fontWeight:"500"}}>Attendace marked for </h2>
              <h2 style={{color:"green", marginTop:"0"}}>{authResult.name}</h2>
            </div>
            <button onClick={() => handleDelete(authResult.id)} style={{border:"1px solid red", color:"red", background:"white", padding:"16px 32px", width:"80%", fontSize:"24px"}}>Not {authResult.name}?</button>
          <button onClick={() => setType("")} style={{border:"1px solid green", color:"green", background:"white", padding:"16px 32px", width:"80%", fontSize:"24px"}}>Go to Home</button>
          </div>
        </>
      )}

      {type === 'Register' && !image && (
        <button onClick={() => setType("")} style={{marginTop:"24px", border:"1px solid grey", color:"grey", background:"white", padding:"16px 32px", width:"100%", fontSize:"24px"}}>Go to Home</button>
      )}
    </div>
  );
};

export default CameraCapture;
