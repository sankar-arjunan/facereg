// src/components/CameraCapture.js

import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const CameraCapture = () => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [name, setName] = useState('');
  const [authResult, setAuthResult] = useState(null);
  const [detectionProbability, setDetectionProbability] = useState(0.0);

  
  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
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
      await axios.post('http://localhost:5001/register_face', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Face registered successfully!');
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
      const response = await axios.post('http://localhost:5001/authenticate_face', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setAuthResult(response.data);
    } catch (error) {
      console.error('Error authenticating image:', error);
      alert('Error authenticating face.');
    }
  };


  const checkFaceDetection = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      const formData = new FormData();
      formData.append('file', dataURLtoFile(imageSrc, 'live-image.jpg'));
      
      try {
        const response = await axios.post('http://localhost:5001/check_face_detection', formData, {
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
    const interval = setInterval(checkFaceDetection, 1000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={360} 
        height={360} 
      />
      <button onClick={capture}>Capture</button>
      {image && <img src={image} alt="Captured" />}
      <input
        type="text"
        placeholder="Enter name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleRegister}>Register</button>
      <button onClick={handleAuthenticate}>Authenticate</button>
      {authResult && (
        <div>
          <h3>Authentication Result:</h3>
          <pre>{JSON.stringify(authResult, null, 2)}</pre>
        </div>
      )}
      
        <div>
          <h3>Face Detection Probability:</h3>
          <p>{detectionProbability==0 ? "No face detected" : detectionProbability}</p>
        </div>
    </div>
  );
};

export default CameraCapture;
