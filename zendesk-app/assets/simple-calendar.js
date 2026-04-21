// Simple Calendar Component
const SimpleCalendar = ({ value, onChange, minDate }) => {
  const [currentMonth, setCurrentMonth] = React.useState(value || new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const isDateDisabled = (date) => {
    if (!minDate) return false;
    return date < minDate.setHours(0, 0, 0, 0);
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (!isDateDisabled(newDate)) {
      onChange(newDate);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = [];
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(React.createElement('div', { key: `empty-${i}`, className: 'cal-day empty' }));
  }

  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const disabled = isDateDisabled(date);
    const selected = value && isSameDay(date, value);
    const today = isSameDay(date, new Date());

    const className = `cal-day ${disabled ? 'disabled' : ''} ${selected ? 'selected' : ''} ${today ? 'today' : ''}`;

    days.push(
      React.createElement('button', {
        key: day,
        className,
        onClick: () => handleDateClick(day),
        disabled,
        type: 'button'
      }, day)
    );
  }

  return React.createElement('div', { className: 'simple-calendar' },
    // Header
    React.createElement('div', { className: 'cal-header' },
      React.createElement('button', {
        type: 'button',
        className: 'cal-nav',
        onClick: handlePrevMonth
      }, '‹'),
      React.createElement('div', { className: 'cal-month-year' },
        `${monthNames[month]} ${year}`
      ),
      React.createElement('button', {
        type: 'button',
        className: 'cal-nav',
        onClick: handleNextMonth
      }, '›')
    ),
    // Day names
    React.createElement('div', { className: 'cal-days-header' },
      ...dayNames.map(day =>
        React.createElement('div', { key: day, className: 'cal-day-name' }, day)
      )
    ),
    // Days grid
    React.createElement('div', { className: 'cal-days-grid' }, ...days)
  );
};

window.SimpleCalendar = SimpleCalendar;
