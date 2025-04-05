import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

interface Memory {
  id: string;
  text: string;
  createdAt: string;
  userId: string;
  userName: string;
  attachments: {
    type: string;
    url: string;
    thumbnailUrl?: string;
  }[];
}

interface Relationship {
  id: string;
  name: string;
  type: string;
  partner: {
    name: string;
    email: string;
  };
  frequency: string;
  duration: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Active' | 'Completed' | 'Deleted';
  revealTheme: string;
}

const RelationshipDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // This is a placeholder for actual API calls
    // In a real implementation, this would fetch data from the backend
    const fetchRelationshipDetails = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          // Mock relationship data
          const mockRelationship: Relationship = {
            id: id || '1',
            name: 'Our Journey',
            type: 'Romantic',
            partner: {
              name: 'Alex Johnson',
              email: 'alex@example.com'
            },
            frequency: 'Weekly',
            duration: '6 months',
            startDate: '2025-01-15',
            endDate: '2025-07-15',
            status: 'Active',
            revealTheme: 'neutral'
          };
          
          // Mock memories data (only visible if relationship is completed)
          const mockMemories: Memory[] = mockRelationship.status === 'Completed' ? [
            {
              id: '101',
              text: 'Our first dinner at that new Italian restaurant. The pasta was amazing!',
              createdAt: '2025-01-20T18:30:00Z',
              userId: 'user1',
              userName: 'You',
              attachments: [
                {
                  type: 'image',
                  url: 'https://example.com/image1.jpg',
                }
              ]
            },
            {
              id: '102',
              text: 'Hiking at Sunset Peak. The view was breathtaking!',
              createdAt: '2025-01-27T14:15:00Z',
              userId: 'user2',
              userName: 'Alex Johnson',
              attachments: [
                {
                  type: 'image',
                  url: 'https://example.com/image2.jpg',
                }
              ]
            }
          ] : [];
          
          setRelationship(mockRelationship);
          setMemories(mockMemories);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load relationship details');
        setLoading(false);
        console.error('Error fetching relationship details:', err);
      }
    };

    fetchRelationshipDetails();
  }, [id]);

  const handleDeleteRelationship = async () => {
    if (window.confirm('Are you sure you want to delete this relationship? This action cannot be undone.')) {
      try {
        // This is a placeholder for actual API call
        // In a real implementation, this would send a delete request to the backend
        console.log('Deleting relationship:', id);
        
        // Simulate API call
        setTimeout(() => {
          // Redirect to dashboard after successful deletion
          navigate('/dashboard');
        }, 1000);
      } catch (err) {
        setError('Failed to delete relationship');
        console.error('Error deleting relationship:', err);
      }
    }
  };

  if (loading) {
    return <div className="loading-indicator">Loading relationship details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!relationship) {
    return <div className="not-found">Relationship not found</div>;
  }

  return (
    <div className="relationship-detail-page">
      <div className="container">
        <div className="page-header">
          <h1>{relationship.name}</h1>
          <div className="status-badge">{relationship.status}</div>
        </div>

        <div className="relationship-info">
          <div className="info-card">
            <h2>Relationship Details</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Type:</span>
                <span className="info-value">{relationship.type}</span>
              </div>
              <div className="info-item">
                <span className="info-label">With:</span>
                <span className="info-value">{relationship.partner.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Frequency:</span>
                <span className="info-value">{relationship.frequency}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Duration:</span>
                <span className="info-value">{relationship.duration}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Start Date:</span>
                <span className="info-value">{new Date(relationship.startDate).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">End Date:</span>
                <span className="info-value">{new Date(relationship.endDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            {relationship.status === 'Active' && (
              <Link to={`/relationships/${id}/add-memory`} className="btn-primary">
                Add Memory
              </Link>
            )}
            {relationship.status === 'Completed' && (
              <Link to={`/relationships/${id}/reveal`} className="btn-primary">
                View Memories
              </Link>
            )}
            <button onClick={handleDeleteRelationship} className="btn-danger">
              Delete Relationship
            </button>
          </div>
        </div>

        {relationship.status === 'Completed' && memories.length > 0 && (
          <div className="memories-section">
            <h2>Shared Memories</h2>
            <div className="memories-list">
              {memories.map(memory => (
                <div key={memory.id} className="memory-card">
                  <div className="memory-header">
                    <span className="memory-author">{memory.userName}</span>
                    <span className="memory-date">
                      {new Date(memory.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="memory-text">{memory.text}</p>
                  {memory.attachments.length > 0 && (
                    <div className="memory-attachments">
                      {memory.attachments.map((attachment, index) => (
                        <div key={index} className="attachment-thumbnail">
                          {attachment.type === 'image' && (
                            <img 
                              src={attachment.url} 
                              alt="Memory attachment" 
                              className="attachment-image"
                            />
                          )}
                          {attachment.type === 'video' && (
                            <div className="video-thumbnail">
                              <img 
                                src={attachment.thumbnailUrl || attachment.url} 
                                alt="Video thumbnail" 
                              />
                              <div className="play-icon">▶</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {relationship.status === 'Pending' && (
          <div className="pending-notice">
            <h3>Waiting for Partner</h3>
            <p>This relationship will become active once {relationship.partner.name} accepts your invitation.</p>
            <button className="btn-secondary">Resend Invitation</button>
          </div>
        )}

        <div className="back-link">
          <Link to="/dashboard">← Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default RelationshipDetailPage;
