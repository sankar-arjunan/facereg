// src/components/RegisterFace.js
import React, { useState } from 'react';
import axios from 'axios';

const RegisterFace = () => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [response, setResponse] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);

    try {
      const result = await axios.post('http://localhost:5001/register_face', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResponse(result.data);
    } catch (error) {
      setResponse(error.response.data);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <input type="text" value={name} onChange={handleNameChange} placeholder="Name" />
      <button onClick={handleSubmit}>Register Face</button>
      <pre>{response && JSON.stringify(response, null, 2)}</pre>
    </div>
  );
};

export default RegisterFace;
