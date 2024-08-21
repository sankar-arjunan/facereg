// src/components/ViewImage.js
import React from 'react';

const ViewImage = ({ filename }) => {
  return (
    <div>
      <img src={`http://localhost:5001/image/${filename}`} alt="Uploaded" style={{ maxWidth: '100%' }} />
    </div>
  );
};

export default ViewImage;
