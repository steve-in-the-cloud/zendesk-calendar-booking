import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css';

function AdminPanel() {
  const [status, setStatus] = useState(null);
  const [bookingTypes, setBookingTypes] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newBookingType, setNewBookingType] = useState({
    name: '',
    duration_minutes: 30,
    description: '',
    color: '#3b82f6'
  });

  useEffect(() => {
    loadStatus();
    loadBookingTypes();
  }, []);

  const loadStatus = async () => {
    try {
      const response = await axios.get('/api/admin/status');
      setStatus(response.data);

      if (response.data.authenticated) {
        loadCalendars();
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load status:', error);
      setLoading(false);
    }
  };

  const loadCalendars = async () => {
    try {
      const response = await axios.get('/api/admin/calendars');
      setCalendars(response.data);
    } catch (error) {
      console.error('Failed to load calendars:', error);
    }
  };

  const loadBookingTypes = async () => {
    try {
      const response = await axios.get('/api/booking-types');
      setBookingTypes(response.data);
    } catch (error) {
      console.error('Failed to load booking types:', error);
    }
  };

  const handleGoogleAuth = () => {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? window.location.origin
      : 'http://localhost:3001';
    window.location.href = `${baseUrl}/auth/google`;
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Google Calendar? You will need to reconnect to use the booking system.')) {
      return;
    }

    try {
      await axios.post('/api/admin/disconnect');
      loadStatus();
      setCalendars([]);
      alert('Disconnected from Google Calendar. You can now reconnect.');
    } catch (error) {
      console.error('Failed to disconnect:', error);
      alert('Failed to disconnect. Please try again.');
    }
  };

  const handleCalendarSelect = async (calendarId) => {
    try {
      await axios.post('/api/admin/calendar', { calendarId });
      loadStatus();
    } catch (error) {
      console.error('Failed to set calendar:', error);
    }
  };

  const handleAddBookingType = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/booking-types', newBookingType);
      setNewBookingType({
        name: '',
        duration_minutes: 30,
        description: '',
        color: '#3b82f6'
      });
      setShowAddForm(false);
      loadBookingTypes();
    } catch (error) {
      console.error('Failed to add booking type:', error);
    }
  };

  const handleDeleteBookingType = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking type?')) {
      return;
    }

    try {
      await axios.delete(`/api/booking-types/${id}`);
      loadBookingTypes();
    } catch (error) {
      console.error('Failed to delete booking type:', error);
    }
  };

  const getBookingUrl = (bookingTypeId) => {
    return `${window.location.origin}/?bookingTypeId=${bookingTypeId}&conversationId=CONVERSATION_ID`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('URL copied to clipboard!');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <h1>Calendar Booking Admin</h1>
      </header>

      <div className="admin-content">
        <section className="admin-section">
          <h2>Google Calendar Connection</h2>

          {!status?.authenticated ? (
            <div className="connection-status disconnected">
              <p>Not connected to Google Calendar</p>
              <button onClick={handleGoogleAuth} className="btn-primary">
                Connect Google Calendar
              </button>
            </div>
          ) : (
            <div className="connection-status connected">
              <p>✓ Connected to Google Calendar</p>

              {calendars.length > 0 && (
                <div className="calendar-selector">
                  <label>Select Calendar:</label>
                  <select
                    value={status.config?.calendarId || 'primary'}
                    onChange={(e) => handleCalendarSelect(e.target.value)}
                  >
                    {calendars.map((cal) => (
                      <option key={cal.id} value={cal.id}>
                        {cal.summary}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button onClick={handleDisconnect} className="btn-secondary" style={{ marginTop: '10px' }}>
                Disconnect & Reconnect
              </button>
            </div>
          )}
        </section>

        <section className="admin-section">
          <div className="section-header">
            <h2>Booking Types</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-secondary"
            >
              {showAddForm ? 'Cancel' : '+ Add Booking Type'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddBookingType} className="booking-form">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={newBookingType.name}
                  onChange={(e) =>
                    setNewBookingType({ ...newBookingType, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Duration (minutes) *</label>
                <input
                  type="number"
                  value={newBookingType.duration_minutes}
                  onChange={(e) =>
                    setNewBookingType({
                      ...newBookingType,
                      duration_minutes: parseInt(e.target.value)
                    })
                  }
                  min="15"
                  step="15"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newBookingType.description}
                  onChange={(e) =>
                    setNewBookingType({ ...newBookingType, description: e.target.value })
                  }
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Color</label>
                <input
                  type="color"
                  value={newBookingType.color}
                  onChange={(e) =>
                    setNewBookingType({ ...newBookingType, color: e.target.value })
                  }
                />
              </div>

              <button type="submit" className="btn-primary">
                Create Booking Type
              </button>
            </form>
          )}

          <div className="booking-types-list">
            {bookingTypes.length === 0 ? (
              <p className="no-items">No booking types yet. Create one to get started.</p>
            ) : (
              bookingTypes.map((type) => (
                <div key={type.id} className="booking-type-card">
                  <div
                    className="color-indicator"
                    style={{ backgroundColor: type.color }}
                  />
                  <div className="booking-type-info">
                    <h3>{type.name}</h3>
                    <p className="duration">{type.duration_minutes} minutes</p>
                    {type.description && (
                      <p className="description">{type.description}</p>
                    )}
                    <div className="url-section">
                      <label>Booking URL:</label>
                      <div className="url-display">
                        <code>{getBookingUrl(type.id)}</code>
                        <button
                          onClick={() => copyToClipboard(getBookingUrl(type.id))}
                          className="btn-copy"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="url-note">
                        Replace CONVERSATION_ID with the actual conversation ID
                      </p>
                    </div>
                  </div>
                  <div className="booking-type-actions">
                    <button
                      onClick={() => handleDeleteBookingType(type.id)}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="admin-section">
          <h2>Setup Instructions</h2>
          <div className="instructions">
            <ol>
              <li>
                <strong>Connect Google Calendar:</strong> Click the "Connect Google Calendar"
                button above and authorize access.
              </li>
              <li>
                <strong>Create Booking Types:</strong> Define different types of appointments
                with their duration.
              </li>
              <li>
                <strong>Use in Zendesk:</strong> Copy the booking URL for each type and use it
                as a Conversation Extension in Zendesk Messaging. Replace CONVERSATION_ID with
                the actual variable.
              </li>
              <li>
                <strong>Environment Variables:</strong> Make sure to set up your Zendesk API
                credentials in the .env file.
              </li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminPanel;
