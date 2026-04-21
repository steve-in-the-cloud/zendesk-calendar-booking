import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './BookingWidget.css';

function BookingWidget() {
  const [bookingType, setBookingType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  useEffect(() => {
    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    const bookingTypeId = params.get('bookingTypeId');
    const convId = params.get('conversationId');

    setConversationId(convId);

    if (bookingTypeId) {
      loadBookingType(bookingTypeId);
    } else {
      setError('Booking type not specified');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (bookingType && selectedDate) {
      loadAvailability();
    }
  }, [selectedDate, bookingType]);

  const loadBookingType = async (id) => {
    try {
      const response = await axios.get(`/api/booking-types/${id}`);
      setBookingType(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load booking type');
      setLoading(false);
    }
  };

  const loadAvailability = async () => {
    try {
      // Create UTC dates to avoid timezone issues
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();

      const startDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

      const response = await axios.get('/api/availability', {
        params: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          duration: bookingType.duration_minutes
        }
      });

      setAvailableSlots(response.data);
      setSelectedSlot(null);
    } catch (err) {
      console.error('Failed to load availability:', err);
      setAvailableSlots([]);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot || !conversationId) {
      setError('Missing required information');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post('/api/bookings', {
        bookingTypeId: bookingType.id,
        conversationId: conversationId,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end
      });

      // Save booking details before clearing
      setConfirmedBooking({
        bookingTypeName: bookingType.name,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end
      });
      setSuccess(true);
      setSelectedSlot(null);
    } catch (err) {
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && !bookingType) {
    return <div className="loading">Loading...</div>;
  }

  if (error && !bookingType) {
    return <div className="error">{error}</div>;
  }

  if (success && confirmedBooking) {
    return (
      <div className="booking-widget">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Booking Confirmed!</h2>
          <p>Your appointment has been scheduled successfully.</p>
          <p className="booking-details">
            <strong>{confirmedBooking.bookingTypeName}</strong><br />
            {formatDate(new Date(confirmedBooking.startTime))}<br />
            {formatTime(confirmedBooking.startTime)} - {formatTime(confirmedBooking.endTime)}
          </p>
          <button onClick={() => setSuccess(false)} className="btn-primary">
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-widget">
      <div className="booking-header">
        <h1>{bookingType?.name}</h1>
        {bookingType?.description && <p className="description">{bookingType.description}</p>}
        <div className="duration">
          Duration: {bookingType?.duration_minutes} minutes
        </div>
      </div>

      <div className="booking-content">
        <div className="calendar-section">
          <h3>Select a Date</h3>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            minDate={new Date()}
            className="custom-calendar"
          />
        </div>

        <div className="slots-section">
          <h3>Available Times for {formatDate(selectedDate)}</h3>

          {availableSlots.length === 0 ? (
            <div className="no-slots">
              No available slots for this date. Please select another date.
            </div>
          ) : (
            <div className="slots-grid">
              {availableSlots.map((slot, index) => (
                <button
                  key={index}
                  className={`slot-button ${selectedSlot === slot ? 'selected' : ''}`}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {formatTime(slot.start)}
                </button>
              ))}
            </div>
          )}

          {selectedSlot && (
            <div className="selected-slot-summary">
              <h4>Selected Time</h4>
              <p>
                {formatDate(new Date(selectedSlot.start))}<br />
                {formatTime(selectedSlot.start)} - {formatTime(selectedSlot.end)}
              </p>
              <button
                onClick={handleBooking}
                disabled={loading}
                className="btn-confirm"
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          )}

          {error && <div className="error">{error}</div>}
        </div>
      </div>
    </div>
  );
}

export default BookingWidget;
