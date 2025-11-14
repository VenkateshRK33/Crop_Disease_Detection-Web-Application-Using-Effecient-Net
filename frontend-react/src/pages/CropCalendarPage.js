import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CropCalendarPage.css';
import PageLayout from '../components/PageLayout';
import Toast from '../components/Toast';
import SkeletonLoader from '../components/SkeletonLoader';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

/**
 * CropCalendarPage Component
 * Displays a calendar for managing crop-related events
 */
function CropCalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [toast, setToast] = useState(null);

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/calendar/events`);
      setEvents(response.data.events || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  // Check if a date has events
  const hasEvents = (date) => {
    return getEventsForDate(date).length > 0;
  };

  // Get upcoming events (next 30 days)
  const getUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today && !event.completed;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 10);
  };

  // Handle date selection
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // Handle add event button
  const handleAddEvent = () => {
    setEditingEvent(null);
    setShowEventForm(true);
  };

  // Handle edit event
  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  // Handle event form close
  const handleFormClose = () => {
    setShowEventForm(false);
    setEditingEvent(null);
  };

  // Handle event saved
  const handleEventSaved = () => {
    fetchEvents();
    handleFormClose();
  };

  // Show toast notification
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Handle optimistic updates
  const handleOptimisticUpdate = (action, eventId, updates = {}) => {
    setEvents(prevEvents => {
      if (action === 'delete') {
        // Remove event from list
        showToast('Event deleted', 'success');
        return prevEvents.filter(e => e._id !== eventId);
      } else if (action === 'update') {
        // Update event in list
        showToast('Event updated', 'success');
        return prevEvents.map(e => 
          e._id === eventId ? { ...e, ...updates } : e
        );
      } else if (action === 'add') {
        // Add new event to list
        showToast('Event created', 'success');
        return [...prevEvents, updates];
      }
      return prevEvents;
    });
  };

  // Tile content for calendar (show dots for events)
  const tileContent = ({ date, view }) => {
    if (view === 'month' && hasEvents(date)) {
      const dayEvents = getEventsForDate(date);
      return (
        <div className="event-indicators">
          {dayEvents.slice(0, 3).map((event, index) => (
            <span 
              key={index} 
              className={`event-dot event-${event.eventType}`}
              title={event.cropType}
            />
          ))}
        </div>
      );
    }
    return null;
  };

  // Tile class name for styling
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const classes = [];
      if (hasEvents(date)) {
        classes.push('has-events');
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tileDate = new Date(date);
      tileDate.setHours(0, 0, 0, 0);
      if (tileDate.getTime() === today.getTime()) {
        classes.push('today');
      }
      return classes.join(' ');
    }
    return null;
  };

  const selectedDateEvents = getEventsForDate(selectedDate);
  const upcomingEvents = getUpcomingEvents();

  return (
    <PageLayout>
      <div className="crop-calendar-page">
        <div className="calendar-header">
          <div className="header-content">
            <h1>🗓️ Crop Planning Calendar</h1>
            <p>Plan and track your farming activities throughout the season</p>
          </div>
          <button className="add-event-btn" onClick={handleAddEvent}>
            + Add Event
          </button>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
            <button onClick={fetchEvents}>Retry</button>
          </div>
        )}

        <div className="calendar-content">
          <div className="calendar-section">
            <div className="calendar-wrapper">
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                tileContent={tileContent}
                tileClassName={tileClassName}
                locale="en-US"
              />
            </div>

            <div className="event-legend">
              <h3>Event Types</h3>
              <div className="legend-items">
                <div className="legend-item">
                  <span className="event-dot event-planting"></span>
                  <span>Planting</span>
                </div>
                <div className="legend-item">
                  <span className="event-dot event-irrigation"></span>
                  <span>Irrigation</span>
                </div>
                <div className="legend-item">
                  <span className="event-dot event-fertilizer"></span>
                  <span>Fertilizer</span>
                </div>
                <div className="legend-item">
                  <span className="event-dot event-pesticide"></span>
                  <span>Pesticide</span>
                </div>
                <div className="legend-item">
                  <span className="event-dot event-harvest"></span>
                  <span>Harvest</span>
                </div>
                <div className="legend-item">
                  <span className="event-dot event-other"></span>
                  <span>Other</span>
                </div>
              </div>
            </div>
          </div>

          <div className="events-sidebar">
            <div className="selected-date-events">
              <h2>
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>
              
              {loading ? (
                <div className="loading">
                  <SkeletonLoader type="card" count={2} />
                </div>
              ) : selectedDateEvents.length > 0 ? (
                <div className="event-list">
                  {selectedDateEvents.map(event => (
                    <EventCard 
                      key={event._id} 
                      event={event}
                      onEdit={handleEditEvent}
                      onRefresh={fetchEvents}
                      onOptimisticUpdate={handleOptimisticUpdate}
                    />
                  ))}
                </div>
              ) : (
                <div className="no-events">
                  <p>No events scheduled for this date</p>
                  <button onClick={handleAddEvent} className="add-event-link">
                    Add an event
                  </button>
                </div>
              )}
            </div>

            <div className="upcoming-events">
              <h2>Upcoming Activities</h2>
              {upcomingEvents.length > 0 ? (
                <div className="upcoming-list">
                  {upcomingEvents.map(event => (
                    <UpcomingEventItem 
                      key={event._id} 
                      event={event}
                      onEdit={handleEditEvent}
                      onRefresh={fetchEvents}
                      onOptimisticUpdate={handleOptimisticUpdate}
                    />
                  ))}
                </div>
              ) : (
                <p className="no-upcoming">No upcoming events</p>
              )}
            </div>
          </div>
        </div>

        {showEventForm && (
          <EventFormModal
            event={editingEvent}
            selectedDate={selectedDate}
            onClose={handleFormClose}
            onSave={handleEventSaved}
            onOptimisticUpdate={handleOptimisticUpdate}
          />
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </PageLayout>
  );
}

/**
 * EventCard Component
 * Displays a single event card
 */
function EventCard({ event, onEdit, onRefresh, onOptimisticUpdate }) {
  const [deleting, setDeleting] = useState(false);
  const [completing, setCompleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      setDeleting(true);
      
      // Optimistic update: Remove event from UI immediately
      onOptimisticUpdate('delete', event._id);
      
      // Make API call
      await axios.delete(`${API_URL}/api/calendar/events/${event._id}`);
      
      // Success - refresh to ensure consistency
      setTimeout(() => onRefresh(), 500);
    } catch (err) {
      console.error('Error deleting event:', err);
      
      // Revert optimistic update on error
      onRefresh();
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleComplete = async () => {
    const newCompletedState = !event.completed;
    
    try {
      setCompleting(true);
      
      // Optimistic update: Update event in UI immediately
      onOptimisticUpdate('update', event._id, { completed: newCompletedState });
      
      // Make API call
      await axios.put(`${API_URL}/api/calendar/events/${event._id}`, {
        completed: newCompletedState
      });
      
      // Success - refresh to ensure consistency
      setTimeout(() => onRefresh(), 500);
    } catch (err) {
      console.error('Error updating event:', err);
      
      // Revert optimistic update on error
      onRefresh();
    } finally {
      setCompleting(false);
    }
  };

  const eventIcons = {
    planting: '🌱',
    irrigation: '💧',
    fertilizer: '🌿',
    pesticide: '🛡️',
    harvest: '🌾',
    other: '📌'
  };

  return (
    <div className={`event-card event-type-${event.eventType} ${event.completed ? 'completed' : ''}`}>
      <div className="event-header">
        <span className="event-icon">{eventIcons[event.eventType]}</span>
        <div className="event-info">
          <h3>{event.cropType}</h3>
          <span className="event-type-label">{event.eventType}</span>
        </div>
        <div className="event-actions">
          <button 
            onClick={() => onEdit(event)} 
            className="edit-btn"
            title="Edit event"
          >
            ✏️
          </button>
          <button 
            onClick={handleDelete} 
            className="delete-btn"
            disabled={deleting}
            title="Delete event"
          >
            {deleting ? '...' : '🗑️'}
          </button>
        </div>
      </div>
      {event.notes && (
        <p className="event-notes">{event.notes}</p>
      )}
      <div className="event-footer">
        <label className="complete-checkbox">
          <input
            type="checkbox"
            checked={event.completed}
            onChange={handleToggleComplete}
            disabled={completing}
          />
          <span>Mark as complete</span>
        </label>
      </div>
    </div>
  );
}

/**
 * UpcomingEventItem Component
 * Displays an upcoming event in the sidebar
 */
function UpcomingEventItem({ event, onEdit, onRefresh, onOptimisticUpdate }) {
  const [updating, setUpdating] = useState(false);
  const eventDate = new Date(event.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));

  const eventIcons = {
    planting: '🌱',
    irrigation: '💧',
    fertilizer: '🌿',
    pesticide: '🛡️',
    harvest: '🌾',
    other: '📌'
  };

  const handleToggleComplete = async () => {
    const newCompletedState = !event.completed;
    
    try {
      setUpdating(true);
      
      // Optimistic update: Update event in UI immediately
      onOptimisticUpdate('update', event._id, { completed: newCompletedState });
      
      // Make API call
      await axios.put(`${API_URL}/api/calendar/events/${event._id}`, {
        completed: newCompletedState
      });
      
      // Success - refresh to ensure consistency
      setTimeout(() => onRefresh(), 500);
    } catch (err) {
      console.error('Error updating event:', err);
      
      // Revert optimistic update on error
      onRefresh();
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="upcoming-event-item" onClick={() => onEdit(event)}>
      <div className="upcoming-event-icon">
        {eventIcons[event.eventType]}
      </div>
      <div className="upcoming-event-details">
        <div className="upcoming-event-title">{event.cropType}</div>
        <div className="upcoming-event-date">
          {eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          {daysUntil === 0 && <span className="today-badge">Today</span>}
          {daysUntil === 1 && <span className="tomorrow-badge">Tomorrow</span>}
          {daysUntil > 1 && <span className="days-badge">in {daysUntil} days</span>}
        </div>
      </div>
      <button 
        className="quick-complete-btn"
        onClick={(e) => {
          e.stopPropagation();
          handleToggleComplete();
        }}
        title="Mark as complete"
      >
        ✓
      </button>
    </div>
  );
}

/**
 * EventFormModal Component
 * Modal for adding/editing events
 */
function EventFormModal({ event, selectedDate, onClose, onSave, onOptimisticUpdate }) {
  const [formData, setFormData] = useState({
    cropType: event?.cropType || '',
    eventType: event?.eventType || 'planting',
    date: event?.date ? new Date(event.date).toISOString().split('T')[0] : selectedDate.toISOString().split('T')[0],
    notes: event?.notes || '',
    reminder: event?.reminder !== undefined ? event.reminder : true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.cropType.trim()) {
      setError('Please enter a crop type');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (event) {
        // Update existing event
        // Optimistic update: Update event in UI immediately
        onOptimisticUpdate('update', event._id, formData);
        
        // Close modal immediately for better UX
        onClose();
        
        // Make API call
        await axios.put(`${API_URL}/api/calendar/events/${event._id}`, formData);
        
        // Success - refresh to ensure consistency
        setTimeout(() => onSave(), 500);
      } else {
        // Create new event
        // Generate temporary ID for optimistic update
        const tempId = `temp-${Date.now()}`;
        const optimisticEvent = {
          _id: tempId,
          ...formData,
          completed: false,
          createdAt: new Date().toISOString()
        };
        
        // Optimistic update: Add event to UI immediately
        onOptimisticUpdate('add', tempId, optimisticEvent);
        
        // Close modal immediately for better UX
        onClose();
        
        // Make API call
        await axios.post(`${API_URL}/api/calendar/events`, formData);
        
        // Success - refresh to get real ID and ensure consistency
        setTimeout(() => onSave(), 500);
      }
    } catch (err) {
      console.error('Error saving event:', err);
      setError(err.response?.data?.message || 'Failed to save event');
      
      // Revert optimistic update on error
      setTimeout(() => onSave(), 100);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{event ? 'Edit Event' : 'Add New Event'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          {error && (
            <div className="form-error">{error}</div>
          )}

          <div className="form-group">
            <label htmlFor="cropType">Crop Type *</label>
            <input
              type="text"
              id="cropType"
              name="cropType"
              value={formData.cropType}
              onChange={handleChange}
              placeholder="e.g., Wheat, Rice, Tomato"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="eventType">Event Type *</label>
            <select
              id="eventType"
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              required
            >
              <option value="planting">🌱 Planting</option>
              <option value="irrigation">💧 Irrigation</option>
              <option value="fertilizer">🌿 Fertilizer</option>
              <option value="pesticide">🛡️ Pesticide</option>
              <option value="harvest">🌾 Harvest</option>
              <option value="other">📌 Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional details..."
              rows="3"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="reminder"
                checked={formData.reminder}
                onChange={handleChange}
              />
              <span>Enable reminder</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? 'Saving...' : event ? 'Update Event' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CropCalendarPage;
