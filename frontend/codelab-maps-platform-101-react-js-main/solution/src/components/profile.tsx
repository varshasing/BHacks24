import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, Chip, Divider, Link, Card, CardContent, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faClock, faUsers, faLanguage, faGlobe, faPhone, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { BACKEND_BASE_URL } from './base_urls';

import { faBook, faGavel, faHome, faHeartbeat, faUtensils, faBriefcase, faChalkboardTeacher, faMoneyBillWave, faBrain, faHandsHelping } from '@fortawesome/free-solid-svg-icons';

// Define a mapping of service types to icons
const showIcon = (category: string) => {
  switch (category) {
      case 'Education':
          return <FontAwesomeIcon icon={faBook} />;
      case 'Legal':
          return <FontAwesomeIcon icon={faGavel} />;
      case 'Housing/Shelter':
          return <FontAwesomeIcon icon={faHome} />;
      case 'Healthcare':
          return <FontAwesomeIcon icon={faHeartbeat} />;
      case 'Food':
          return <FontAwesomeIcon icon={faUtensils} />;
      case 'Employment':
          return <FontAwesomeIcon icon={faBriefcase} />;
      case 'Community Education':
          return <FontAwesomeIcon icon={faChalkboardTeacher} />;
      case 'Cash Assistance':
          return <FontAwesomeIcon icon={faMoneyBillWave} />;
      case 'Mental Health Services':
          return <FontAwesomeIcon icon={faBrain} />;
      case 'Case Management':
          return <FontAwesomeIcon icon={faHandsHelping} />;
      default:
          return null; // Or a default icon if preferred
  }
};

interface ProfileProps {
  ID: string;
  name: string;
  services: string[];
  languages?: string[]; // Make optional
  phone?: string;       // Make optional
  address?: string;     // Make optional
  website?: string;     // Make optional
  demographics?: string;// Make optional
  summary?: string;     // Make optional
  hours?: string;       // Make optional
  upvote?: number;
  onBack: () => void;
  onUpvote: (id: string, newUpvoteCount: number) => void;
}

const Profile: React.FC<ProfileProps> = ({
  ID,
  name,
  services,
  summary,
  address,
  hours,
  demographics,
  languages,
  website,
  phone,
  upvote,
  onBack,
  onUpvote,
}) => {
  const [currentUpvote, setCurrentUpvote] = useState(upvote || 0);
  const [upvoteClicked, setUpvoteClicked] = useState(false); // Track if upvote has been clicked
  async function getReviewUpvote(reviewId) {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/reviews/${encodeURI(reviewId)}`);

      if (!response.ok) {
        throw new Error(`Error fetching review: ${response.statusText}`);
      }

      const data = await response.json();

      // Retrieve and return the upvote value
      return data.upvote;
    } catch (error) {
      console.error('Failed to retrieve upvote:', error);
      return null;
    }
  }
  useEffect(() => {
    const fetchUpvote = async () => {
      const upvoteCount = await getReviewUpvote(ID);
      if (upvoteCount !== null) {
        setCurrentUpvote(upvoteCount);
      }
    };

    fetchUpvote();
  }, [ID]);
  const handleUpvote = async () => {
    if (upvoteClicked) return;

    const newUpvoteCount = currentUpvote + 1;
    setCurrentUpvote(newUpvoteCount);
    setUpvoteClicked(true);

    onUpvote(ID, newUpvoteCount);

    try {
      const url = `${BACKEND_BASE_URL}/reviews/`;
      const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ID, upvote: 1 })
      });
  
      if (!response.ok) {
          console.error('Failed to upvote on the backend');
      } else {
          onUpvote(ID, currentUpvote + 1); // Inform App about the new upvote count
      }
  } catch (error) {
      console.error('Error during upvote:', error);
  }
  };
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 2000,
        backgroundColor: '#ffffff',
        color: '#000000',
        overflowY: 'auto',
        p: 3,
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ maxWidth: '600px', width: '100%', boxSizing: 'border-box' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={onBack} color="primary" aria-label="back">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" color="primary" sx={{ flexGrow: 1, textAlign: 'center', pr: 3 }}>
            {name}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        {services.map((service, index) => (
            <Chip
              key={index}
              icon={showIcon(service)} // Default icon if no mapping is found
              label={service}
              variant="outlined"
              color="primary"
            />
          ))}
        </Box>

        {summary && (
          <Typography variant="body1" color="textSecondary" paragraph>
            {summary}
          </Typography>
        )}

        <Card variant="outlined" sx={{ mt: 3 }}>
          <CardContent sx={{ p: 0 }}>
            {address && (
              <>
                <DetailItem icon={faMapMarkerAlt} label="Address" value={address} />
                {(hours || demographics || languages || website || phone) && <Divider />}
              </>
            )}
            {hours && (
              <>
                <DetailItem icon={faClock} label="Hours" value={hours} />
                {(demographics || languages || website || phone) && <Divider />}
              </>
            )}
            {demographics && (
              <>
                <DetailItem icon={faUsers} label="Demographics" value={demographics} />
                {(languages || website || phone) && <Divider />}
              </>
            )}
            {languages && languages.length > 0 && (
              <>
                <DetailItem icon={faLanguage} label="Languages" value={languages.join(', ')} />
                {(website || phone) && <Divider />}
              </>
            )}
            {website && (
              <>
                <DetailItem icon={faGlobe} label="Website" value={website} isLink />
                {phone && <Divider />}
              </>
            )}
            {phone && (
              <>
                <DetailItem icon={faPhone} label="Phone" value={phone} isPhone />
              </>
            )}
          </CardContent>
        </Card>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 3 }}>
      <Typography variant="h6" sx={{ mr: 1 }}>
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleUpvote}
        startIcon={<FontAwesomeIcon icon={faThumbsUp} />}
        disabled={upvoteClicked}
      >
        {currentUpvote}
      </Button>
      </Box>
      </Box>
    </Box>
  );
};

// Helper component for each detail item
const DetailItem = ({
  icon,
  label,
  value,
  isLink,
  isPhone,
}: {
  icon: any;
  label: string;
  value: string;
  isLink?: boolean;
  isPhone?: boolean;
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', py: 1, px: 2 }}>
    <FontAwesomeIcon icon={icon} style={{ marginRight: 8, color: '#1f7ecb' }} />
    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>
      {label}:
    </Typography>
    {isLink ? (
      <Link href={value} target="_blank" rel="noopener noreferrer" color="primary" underline="hover">
        {value}
      </Link>
    ) : isPhone ? (
      <Link href={`tel:${value}`} color="primary" underline="hover">
        {value}
      </Link>
    ) : (
      <Typography variant="body2" color="textSecondary">
        {value}
      </Typography>
    )}
  </Box>
);

export default Profile;
