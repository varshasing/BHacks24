// components/Profile.tsx

import React from 'react';
import globeIcon from '../../images/globe.png'

interface ProfileProps {
    name: string;
    services: string[];
    languages: string[];
    phone: string;
    address: string;
    website: string;
    demographics: string;
    summary: string;
    hours: string;
    onBack: () => void; // Callback function for the back button
}

const Profile: React.FC<ProfileProps> = ({ name, services, summary, address, hours, demographics, languages, website, phone, onBack }) => {
    return (
        <div style={overlayStyle}>
        <div style={headerStyle}>
          <h2 style={nameStyle}>{name}</h2>
          <button onClick={onBack} style={backButtonStyle}>Back</button>
        </div>
        <div style={typesContainerStyle}>
          {services.map((type, index) => (
            <span key={index} style={typeStyle}>{type}</span>
          ))}
        </div>
        <p style={summaryStyle}>{summary}</p>
        <div style={detailsContainerStyle}>
          <DetailItem icon={globeIcon} label="Address" value={address} />
          <DetailItem icon={globeIcon} label="Hours" value={hours} />
          <DetailItem icon={globeIcon} label="Demographics" value={demographics} />
          <DetailItem icon={globeIcon} label="Languages" value={languages.join(', ')} />
          <DetailItem icon={globeIcon} label="Website" value={website} isLink />
          <DetailItem icon={globeIcon} label="Phone" value={phone} isPhone />
        </div>
      </div>
    );
  };
    // Helper component for each detail item
const DetailItem = ({ icon, label, value, isLink, isPhone }: {
    icon: string;
    label: string;
    value: string;
    isLink?: boolean;
    isPhone?: boolean;
  }) => (
    <div style={detailItemStyle}>
      <img src={icon} alt={label} style={iconStyle} />
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer" style={linkStyle}>{value}</a>
      ) : isPhone ? (
        <a href={`tel:${value}`} style={linkStyle}>{value}</a>
      ) : (
        <span>{value}</span>
      )}
    </div>
  );
  
  // Styles
const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff', // White background
    color: '#000000', // Black text
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    fontFamily: '"Cocomat Pro", sans-serif',
    overflowY: 'auto',
  };
  
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    padding: '20px',
    boxSizing: 'border-box',
  };
  
  const nameStyle: React.CSSProperties = {
    fontSize: '1.5em',
    margin: 0,
    color: '#1f7ecb',
  };
  
  const backButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    right: '20px', // Positions the button relative to the right edge
    padding: '8px 16px',
    backgroundColor: '#1f7ecb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: '0.9em', // Adjust font size for better readability on smaller screens
    whiteSpace: 'nowrap', // Prevents text wrapping
    maxWidth: 'fit-content', // Ensures it adjusts to content size
  };

  const typesContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginTop: '10px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  };
  
  const typeStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    color: '#000000',
    fontSize: '0.9em',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '80px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    border: '1px solid #ddd',
  };
  
  const summaryStyle: React.CSSProperties = {
    margin: '15px 0',
    textAlign: 'center',
    fontSize: '1em',
    color: '#000000',
  };
  
  const detailsContainerStyle: React.CSSProperties = {
    width: '100%',
    marginTop: '15px',
  };
  
  const detailItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
    paddingBottom: '10px',
    paddingLeft: '20px', // Adds padding on the left
    paddingRight: '20px', // Adds padding on the right
    borderBottom: '1px solid #ddd', // Thin gray line as separator
    marginLeft: 'auto', // Centers the item within the container
    marginRight: 'auto', // Centers the item within the container
    maxWidth: '90%', // Limits the width to avoid spanning the entire container
  };
  
  const iconStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    marginRight: '8px',
  };
  
  const labelStyle: React.CSSProperties = {
    fontWeight: 'bold',
    marginRight: '5px',
    color: '#000000',
  };
  
  const linkStyle: React.CSSProperties = {
    color: '#1f7ecb',
    textDecoration: 'none',
  };
  
  export default Profile;
      
// interface ProfileProps {
//   name: string;
//   type: string;
//   languages: string[];
//   phone: string;
//   address: string;
//   website: string;
//   onBack: () => void; // Callback function for the back button
// }

// const Profile: React.FC<ProfileProps> = ({ name, type, languages, phone, address, website, onBack }) => {
//   return (
//     <div style={overlayStyle}>
//       <button onClick={onBack} style={backButtonStyle}>Back</button>
//       <div style={contentStyle}>
//         <h3>{name}</h3>
//         <p><strong>Service Type:</strong> {type}</p>
//         <p><strong>Languages:</strong> {languages.join(', ')}</p>
//         <p><strong>Phone:</strong> <a href={`tel:${phone}`} style={linkStyle}>{phone}</a></p>
//         <p><strong>Address:</strong> {address}</p>
//         <p><strong>Website:</strong> <a href={website} target="_blank" rel="noopener noreferrer" style={linkStyle}>{website}</a></p>
//       </div>
//     </div>
//   );
// };

// // Inline styles using the theme
// const overlayStyle: React.CSSProperties = {
//     position: 'fixed',
//     top: 0,
//     left: 0,
//     width: '100%',
//     height: '100%',
//     backgroundColor: 'rgba(0, 0, 0, 0.8)',
//     color: '#fff',
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     justifyContent: 'center',
//     zIndex: 1000,
//   };

// const backButtonStyle: React.CSSProperties = {
//   position: 'absolute',
//   top: '20px',
//   left: '20px',
//   padding: '10px 20px',
//   backgroundColor: '#dddcdb',
//   color: '#1f7ecb',
//   border: 'none',
//   borderRadius: '4px',
//   cursor: 'pointer',
//   fontFamily: '"Cocomat Pro", sans-serif',
//   fontWeight: 'bold',
//   textTransform: 'uppercase',
// };

// const contentStyle: React.CSSProperties = {
//   padding: '20px',
//   border: `1px solid #1f7ecb`,
//   borderRadius: '8px',
//   maxWidth: '300px',
//   backgroundColor: '#f2f2f2', // Opaque background for readability
//   color: '#1f7ecb',
//   fontFamily: '"Cocomat Pro", sans-serif',
// };

// const linkStyle: React.CSSProperties = {
//   color: '#1f7ecb',
//   textDecoration: 'none',
//   fontWeight: 'bold',
// };

// export default Profile;
