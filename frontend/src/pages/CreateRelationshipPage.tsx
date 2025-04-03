import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateRelationshipPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    partnerEmail: '',
    frequency: 'Weekly',
    duration: '3 months',
    revealTheme: 'neutral'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // This is a placeholder for actual API call
      // In a real implementation, this would send data to the backend
      console.log('Creating relationship with:', formData);
      
      // Simulate API call
      setTimeout(() => {
        // Redirect to dashboard after successful creation
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError('Failed to create relationship. Please try again.');
      console.error('Error creating relationship:', err);
      setLoading(false);
    }
  };

  return (
    <div className="create-relationship-page">
      <div className="container">
        <div className="page-header">
          <h1>Create New Relationship</h1>
        </div>

        <div className="form-container">
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h2>Relationship Details</h2>
              
              <div className="form-group">
                <label htmlFor="name">Relationship Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Our Journey, Work Mentorship"
                />
                <small>Choose a meaningful name for your relationship</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="type">Relationship Type</label>
                <input
                  type="text"
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Romantic, Friendship, Family, Professional"
                />
                <small>Describe the type of relationship</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="partnerEmail">Partner's Email</label>
                <input
                  type="email"
                  id="partnerEmail"
                  name="partnerEmail"
                  value={formData.partnerEmail}
                  onChange={handleChange}
                  required
                  placeholder="Enter your partner's email address"
                />
                <small>They will receive an invitation to join this relationship</small>
              </div>
            </div>
            
            <div className="form-section">
              <h2>Memory Settings</h2>
              
              <div className="form-group">
                <label htmlFor="frequency">Memory Frequency</label>
                <select
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  required
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
                <small>How often you'll be reminded to add memories</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="duration">Relationship Duration</label>
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                >
                  <option value="3 months">3 months</option>
                  <option value="6 months">6 months</option>
                  <option value="1 year">1 year</option>
                </select>
                <small>When memories will be revealed to both of you</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="revealTheme">Reveal Theme</label>
                <select
                  id="revealTheme"
                  name="revealTheme"
                  value={formData.revealTheme}
                  onChange={handleChange}
                >
                  <option value="neutral">Neutral</option>
                  <option value="romantic">Romantic</option>
                  <option value="friendly">Friendly</option>
                  <option value="professional">Professional</option>
                </select>
                <small>Visual theme for the memory reveal experience</small>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Relationship'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRelationshipPage;
