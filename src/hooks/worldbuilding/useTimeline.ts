
import { useState } from 'react';
import type { TimelineEvent } from './types';

export const useTimeline = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const addEvent = (eventData: Omit<TimelineEvent, 'id'>) => {
    const newEvent: TimelineEvent = {
      ...eventData,
      id: crypto.randomUUID()
    };
    setEvents(prev => [...prev, newEvent].sort((a, b) => a.date.localeCompare(b.date)));
    return newEvent;
  };

  const updateEvent = (eventId: string, updates: Partial<TimelineEvent>) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, ...updates } : event
    ).sort((a, b) => a.date.localeCompare(b.date)));
  };

  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const getEventsByType = (type: TimelineEvent['type']) => {
    return events.filter(event => event.type === type);
  };

  const getRelatedEvents = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return [];
    
    return events.filter(e => 
      event.relatedEvents.includes(e.id) || e.relatedEvents.includes(eventId)
    );
  };

  const selectedEvent = events.find(event => event.id === selectedEventId);

  return {
    events,
    selectedEvent,
    selectedEventId,
    setSelectedEventId,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsByType,
    getRelatedEvents
  };
};
