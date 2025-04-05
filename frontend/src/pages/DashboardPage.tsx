import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
}

const DashboardPage: React.FC = () => {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // This is a placeholder for actual API call
    // In a real implementation, this would fetch data from the backend
    const fetchRelationships = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          const mockRelationships: Relationship[] = [
            {
              id: '1',
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
              status: 'Active'
            },
            {
              id: '2',
              name: 'Work Mentorship',
              type: 'Professional',
              partner: {
                name: 'Sam Taylor',
                email: 'sam@example.com'
              },
              frequency: 'Monthly',
              duration: '1 year',
              startDate: '2025-02-01',
              endDate: '2026-02-01',
              status: 'Active'
            },
            {
              id: '3',
              name: 'Family Memories',
              type: 'Family',
              partner: {
                name: 'Jordan Smith',
                email: 'jordan@example.com'
              },
              frequency: 'Weekly',
              duration: '3 months',
              startDate: '2025-03-01',
              endDate: '2025-06-01',
              status: 'Pending'
            }
          ];
          
          setRelationships(mockRelationships);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load relationships');
        setLoading(false);
        console.error('Error fetching relationships:', err);
      }
    };

    fetchRelationships();
  }, []);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Active':
        return 'status-active';
      case 'Pending':
        return 'status-pending';
      case 'Completed':
        return 'status-completed';
      default:
        return '';
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>My Relationships</h1>
          <Link to="/relationships/create" className="btn-primary">
            Create Relationship
          </Link>
        </div>

        {loading ? (
          <div className="loading-indicator">Loading your relationships...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            {relationships.length === 0 ? (
              <div className="empty-state">
                <h3>No relationships yet</h3>
                <p>Create your first relationship to start collecting memories.</p>
                <Link to="/relationships/create" className="btn-primary">
                  Create Relationship
                </Link>
              </div>
            ) : (
              <div className="relationship-grid">
                {relationships.map((relationship) => (
                  <div key={relationship.id} className="relationship-card">
                    <div className="relationship-header">
                      <h3>{relationship.name}</h3>
                      <span className={`status-badge ${getStatusClass(relationship.status)}`}>
                        {relationship.status}
                      </span>
                    </div>
                    <div className="relationship-details">
                      <p><strong>Type:</strong> {relationship.type}</p>
                      <p><strong>With:</strong> {relationship.partner.name}</p>
                      <p><strong>Frequency:</strong> {relationship.frequency}</p>
                      <p><strong>Duration:</strong> {relationship.duration}</p>
                      <p><strong>End Date:</strong> {new Date(relationship.endDate).toLocaleDateString()}</p>
                    </div>
                    <div className="relationship-actions">
                      <Link to={`/relationships/${relationship.id}`} className="btn-secondary">
                        View Details
                      </Link>
                      {relationship.status === 'Active' && (
                        <Link to={`/relationships/${relationship.id}/add-memory`} className="btn-primary">
                          Add Memory
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
