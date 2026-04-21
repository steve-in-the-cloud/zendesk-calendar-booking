const { createElement: h, useState, useEffect } = React;
const Calendar = window.SimpleCalendar;

const App = () => {
  const [client, setClient] = useState(null);
  const [apiUrl, setApiUrl] = useState(null);
  const [ticketId, setTicketId] = useState(null);
  const [bookingTypes, setBookingTypes] = useState([]);
  const [selectedBookingType, setSelectedBookingType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    const zafClient = window.ZAFClient.init();
    setClient(zafClient);

    zafClient.invoke('resize', { width: '100%', height: '600px' });

    Promise.all([
      zafClient.get('ticket.id'),
      zafClient.metadata()
    ]).then(([ticketData, metadata]) => {
      setTicketId(ticketData['ticket.id']);
      setApiUrl(metadata.settings.api_url);
      loadBookingTypes(metadata.settings.api_url);
    }).catch(err => {
      setError('Failed to initialize Zendesk app');
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedBookingType && selectedDate && apiUrl) {
      loadAvailability();
    }
  }, [selectedDate, selectedBookingType, apiUrl]);

  const loadBookingTypes = async (url) => {
    try {
      const response = await axios.get(`${url}/api/booking-types`);
      setBookingTypes(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load booking types');
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

      const response = await axios.get(`${apiUrl}/api/availability`, {
        params: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          duration: selectedBookingType.duration_minutes
        }
      });

      setAvailableSlots(response.data);
      setSelectedSlot(null);
    } catch (err) {
      console.error('Failed to load availability:', err);
      setAvailableSlots([]);
    }
  };

  const handleBookingTypeChange = (e) => {
    const typeId = e.target.value;
    const bookingType = bookingTypes.find(bt => bt.id === parseInt(typeId));
    setSelectedBookingType(bookingType);
    setSelectedSlot(null);
    setError(null);
  };

  const handleBooking = async () => {
    if (!selectedSlot || !ticketId) {
      setError('Missing required information');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post(`${apiUrl}/api/bookings`, {
        bookingTypeId: selectedBookingType.id,
        ticketId: ticketId,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end
      });

      const bookingDetails = {
        bookingTypeName: selectedBookingType.name,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end
      };

      setConfirmedBooking(bookingDetails);
      setSuccess(true);
      setSelectedSlot(null);

      if (client) {
        // Show success notification
        client.invoke('notify', 'Booking confirmed successfully!', 'notice');

        // Insert comment draft with booking details
        const commentText = `Your ${bookingDetails.bookingTypeName} appointment has been scheduled:\n\n` +
          `📅 Date: ${formatDate(new Date(bookingDetails.startTime))}\n` +
          `🕐 Time: ${formatTime(bookingDetails.startTime)} - ${formatTime(bookingDetails.endTime)}\n\n` +
          `A calendar invitation has been created for this appointment.`;

        client.invoke('ticket.editor.insert', commentText);
      }
    } catch (err) {
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetBooking = () => {
    setSuccess(false);
    setConfirmedBooking(null);
    setSelectedBookingType(null);
    setSelectedSlot(null);
    setSelectedDate(new Date());
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

  if (loading && bookingTypes.length === 0) {
    return h('div', { className: 'loading' }, 'Loading...');
  }

  if (error && bookingTypes.length === 0) {
    return h('div', { className: 'error' }, error);
  }

  if (success && confirmedBooking) {
    return h('div', { className: 'success' },
      h('div', { className: 'success-icon' }, '✓'),
      h('h3', null, 'Booking Confirmed!'),
      h('p', null, 'The appointment has been scheduled successfully.'),
      h('div', { className: 'booking-details' },
        h('strong', null, confirmedBooking.bookingTypeName),
        h('br'),
        formatDate(new Date(confirmedBooking.startTime)),
        h('br'),
        `${formatTime(confirmedBooking.startTime)} - ${formatTime(confirmedBooking.endTime)}`
      ),
      h('button', {
        onClick: resetBooking,
        className: 'btn-secondary',
        style: { marginTop: '12px' }
      }, 'Book Another Appointment')
    );
  }

  return h('div', null,
    h('div', { className: 'form-group' },
      h('label', { htmlFor: 'booking-type' }, 'Select Booking Type'),
      h('select', {
        id: 'booking-type',
        value: selectedBookingType?.id || '',
        onChange: handleBookingTypeChange
      },
        h('option', { value: '' }, '-- Choose a booking type --'),
        bookingTypes.map(bt =>
          h('option', { key: bt.id, value: bt.id }, bt.name)
        )
      )
    ),

    selectedBookingType && h('div', { className: 'booking-type-info' },
      h('strong', null, selectedBookingType.name),
      selectedBookingType.description && h('div', { className: 'description' }, selectedBookingType.description),
      h('div', { className: 'duration' }, `Duration: ${selectedBookingType.duration_minutes} minutes`)
    ),

    selectedBookingType && h('div', null,
      h('div', { className: 'calendar-container' },
        h('h3', null, 'Select a Date'),
        h(Calendar, {
          onChange: setSelectedDate,
          value: selectedDate,
          minDate: new Date()
        })
      ),

      h('div', { className: 'slots-section' },
        h('h3', null, `Available Times`),
        h('div', { className: 'date-display' }, formatDate(selectedDate)),

        availableSlots.length === 0
          ? h('div', { className: 'no-slots' }, 'No available slots for this date. Please select another date.')
          : h('div', { className: 'slots-grid' },
              availableSlots.map((slot, index) =>
                h('button', {
                  key: index,
                  className: `slot-button ${selectedSlot === slot ? 'selected' : ''}`,
                  onClick: () => setSelectedSlot(slot)
                }, formatTime(slot.start))
              )
            )
      ),

      selectedSlot && h('div', { className: 'selected-slot-summary' },
        h('h4', null, 'Selected Time'),
        h('p', null,
          formatDate(new Date(selectedSlot.start)),
          h('br'),
          `${formatTime(selectedSlot.start)} - ${formatTime(selectedSlot.end)}`
        ),
        h('button', {
          onClick: handleBooking,
          disabled: loading,
          className: 'btn-primary'
        }, loading ? 'Booking...' : 'Confirm Booking')
      ),

      error && h('div', { className: 'error', style: { marginTop: '16px' } }, error)
    )
  );
};

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(h(App));
