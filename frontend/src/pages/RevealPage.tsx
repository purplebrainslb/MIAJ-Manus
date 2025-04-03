import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

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
  creator: {
    name: string;
    email: string;
  };
  revealTheme: string;
}

const RevealPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    // This is a placeholder for actual API calls
    // In a real implementation, this would fetch data from the backend
    const fetchRevealData = async () => {
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
            creator: {
              name: 'You',
              email: 'you@example.com'
            },
            revealTheme: 'neutral'
          };
          
          // Mock memories data
          const mockMemories: Memory[] = [
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
            },
            {
              id: '103',
              text: 'Movie night at home. We watched that sci-fi film you\'ve been wanting to see.',
              createdAt: '2025-02-03T20:00:00Z',
              userId: 'user1',
              userName: 'You',
              attachments: [
                {
                  type: 'image',
                  url: 'https://example.com/image3.jpg',
                }
              ]
            },
            {
              id: '104',
              text: 'Coffee shop work session. We were so productive!',
              createdAt: '2025-02-10T10:30:00Z',
              userId: 'user2',
              userName: 'Alex Johnson',
              attachments: [
                {
                  type: 'image',
                  url: 'https://example.com/image4.jpg',
                }
              ]
            }
          ];
          
          setRelationship(mockRelationship);
          setMemories(mockMemories);
          setLoading(false);
        }, 1500);
      } catch (err) {
        setError('Failed to load reveal data');
        setLoading(false);
        console.error('Error fetching reveal data:', err);
      }
    };

    fetchRevealData();
  }, [id]);

  const handleExport = async (type: 'pdf' | 'video') => {
    setExportLoading(true);
    setExportError('');

    try {
      // This is a placeholder for actual export API call
      // In a real implementation, this would request the backend to generate the export
      console.log(`Exporting ${type} for relationship:`, id);
      
      // Simulate API call
      setTimeout(() => {
        alert(`Your ${type.toUpperCase()} export has been generated and will be emailed to you shortly.`);
        setExportLoading(false);
      }, 2000);
    } catch (err) {
      setExportError(`Failed to generate ${type.toUpperCase()} export. Please try again.`);
      console.error('Error generating export:', err);
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="reveal-page loading">
        <div className="container">
          <div className="loading-indicator">
            <h2>Loading your memories...</h2>
            <p>This might take a moment as we prepare your special reveal.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reveal-page error">
        <div className="container">
          <div className="error-message">
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!relationship || memories.length === 0) {
    return (
      <div className="reveal-page empty">
        <div className="container">
          <div className="empty-state">
            <h2>No Memories Found</h2>
            <p>It seems there are no memories to reveal for this relationship.</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`reveal-page theme-${relationship.revealTheme}`}>
      <div className="reveal-header">
        <div className="container">
          <h1>Memory Reveal</h1>
          <h2>{relationship.name}</h2>
          <p className="reveal-subtitle">
            A collection of memories between {relationship.creator.name} and {relationship.partner.name}
          </p>
        </div>
      </div>

      <div className="container">
        <div className="export-options">
          <h3>Save Your Memories</h3>
          {exportError && <div className="error-message">{exportError}</div>}
          <div className="export-buttons">
            <button 
              onClick={() => handleExport('pdf')} 
              className="btn-export"
              disabled={exportLoading}
            >
              {exportLoading ? 'Generating...' : 'Export as PDF'}
            </button>
            <button 
              onClick={() => handleExport('video')} 
              className="btn-export"
              disabled={exportLoading}
            >
              {exportLoading ? 'Generating...' : 'Create Video Montage'}
            </button>
          </div>
          <p className="export-note">
            Note: Exports will be available for 30 days. You'll receive an email when they're ready.
          </p>
        </div>

        <div className="memories-timeline">
          <h3>Your Journey Together</h3>
          
          <div className="timeline">
            {memories.map((memory, index) => (
              <div key={memory.id} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
                <div className="timeline-date">
                  {new Date(memory.createdAt).toLocaleDateString()}
                </div>
                <div className="memory-card">
                  <div className="memory-header">
                    <span className="memory-author">{memory.userName}</span>
                  </div>
                  <p className="memory-text">{memory.text}</p>
                  {memory.attachments.length > 0 && (
                    <div className="memory-attachments">
                      {memory.attachments.map((attachment, idx) => (
                        <div key={idx} className="attachment-preview">
                          {attachment.type === 'image' && (
                            <img 
                              src={attachment.url} 
                              alt="Memory attachment" 
                              className="attachment-image"
                            />
                          )}
                          {attachment.type === 'video' && (
                            <div className="video-preview">
                              <img 
                                src={attachment.thumbnailUrl || attachment.url} 
                                alt="Video thumbnail" 
                              />
                              <div className="play-icon">▶</div>
                            </div>
                          )}
                          {attachment.type === 'audio' && (
                            <div className="audio-preview">
                              <div className="audio-icon">🔊</div>
                              <span>Audio Recording</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="reveal-footer">
          <p>These memories will be available for 30 days.</p>
          <Link to="/dashboard" className="btn-secondary">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RevealPage;
