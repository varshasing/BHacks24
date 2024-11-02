// components/Profile.tsx

import React from 'react';

interface ProfileProps {
  name: string;
  type: string;
  languages: string[];
  phone: string;
  address: string;
  website: string;
  onBack: () => void; // Callback function for the back button
}

const Profile: React.FC<ProfileProps> = ({ name, type, languages, phone, address, website, onBack }) => {
  return (
    <div style={overlayStyle}>
      <button onClick={onBack} style={backButtonStyle}>Back</button>
      <div style={contentStyle}>
        <h3>{name}</h3>
        <p><strong>Service Type:</strong> {type}</p>
        <p><strong>Languages:</strong> {languages.join(', ')}</p>
        <p><strong>Phone:</strong> <a href={`tel:${phone}`} style={linkStyle}>{phone}</a></p>
        <p><strong>Address:</strong> {address}</p>
        <p><strong>Website:</strong> <a href={website} target="_blank" rel="noopener noreferrer" style={linkStyle}>{website}</a></p>
      </div>
    </div>
  );
};

// Inline styles using the theme
const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

const backButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '20px',
  left: '20px',
  padding: '10px 20px',
  backgroundColor: '#dddcdb',
  color: '#1f7ecb',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontFamily: '"Cocomat Pro", sans-serif',
  fontWeight: 'bold',
  textTransform: 'uppercase',
};

const contentStyle: React.CSSProperties = {
  padding: '20px',
  border: `1px solid #1f7ecb`,
  borderRadius: '8px',
  maxWidth: '300px',
  backgroundColor: '#f2f2f2', // Opaque background for readability
  color: '#1f7ecb',
  fontFamily: '"Cocomat Pro", sans-serif',
};

const linkStyle: React.CSSProperties = {
  color: '#1f7ecb',
  textDecoration: 'none',
  fontWeight: 'bold',
};

export default Profile;
