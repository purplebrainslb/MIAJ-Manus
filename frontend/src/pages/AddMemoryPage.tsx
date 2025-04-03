import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AddMemoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    text: '',
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      text: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      // Check file size (25MB limit per file)
      const validFiles = fileList.filter(file => file.size <= 25 * 1024 * 1024);
      
      if (validFiles.length !== fileList.length) {
        setError('Some files exceed the 25MB size limit and were not added.');
      }
      
      setAttachments(prev => [...prev, ...validFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.text.trim() === '' && attachments.length === 0) {
      setError('Please add text or at least one attachment.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // This is a placeholder for actual API call
      // In a real implementation, this would send data to the backend
      console.log('Adding memory to relationship:', id);
      console.log('Memory text:', formData.text);
      console.log('Attachments:', attachments.map(file => file.name));
      
      // Simulate API call
      setTimeout(() => {
        // Redirect to relationship detail page after successful submission
        navigate(`/relationships/${id}`);
      }, 1500);
    } catch (err) {
      setError('Failed to add memory. Please try again.');
      console.error('Error adding memory:', err);
      setLoading(false);
    }
  };

  return (
    <div className="add-memory-page">
      <div className="container">
        <div className="page-header">
          <h1>Add Memory</h1>
        </div>

        <div className="form-container">
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="text">What's your memory?</label>
              <textarea
                id="text"
                name="text"
                value={formData.text}
                onChange={handleTextChange}
                placeholder="Share a special moment, thought, or feeling..."
                rows={5}
              />
            </div>
            
            <div className="form-group">
              <label>Add Photos, Videos, or Audio</label>
              <div className="file-upload-container">
                <input
                  type="file"
                  id="attachments"
                  onChange={handleFileChange}
                  multiple
                  accept="image/*,video/*,audio/*"
                  className="file-input"
                />
                <label htmlFor="attachments" className="file-upload-button">
                  Choose Files
                </label>
                <span className="file-hint">Max 25MB per file</span>
              </div>
              
              {attachments.length > 0 && (
                <div className="attachments-preview">
                  <h4>Selected Files:</h4>
                  <ul className="attachments-list">
                    {attachments.map((file, index) => (
                      <li key={index} className="attachment-item">
                        <span className="attachment-name">{file.name}</span>
                        <span className="attachment-size">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                        <button
                          type="button"
                          className="remove-attachment"
                          onClick={() => removeAttachment(index)}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => navigate(`/relationships/${id}`)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Memory'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMemoryPage;
