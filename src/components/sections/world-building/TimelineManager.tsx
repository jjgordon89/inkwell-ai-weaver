
import React, { useState } from 'react';
import { Clock, Plus, Calendar, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTimeline } from '@/hooks/worldbuilding/useTimeline';
import type { TimelineEvent } from '@/hooks/worldbuilding/types';

const TimelineManager = () => {
  const {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsByType
  } = useTimeline();

  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [selectedType, setSelectedType] = useState<TimelineEvent['type'] | 'all'>('all');
  const [eventForm, setEventForm] = useState<Partial<TimelineEvent>>({
    title: '',
    description: '',
    date: '',
    type: 'historical',
    characterIds: [],
    consequences: [],
    relatedEvents: []
  });

  const handleAddEvent = () => {
    if (eventForm.title?.trim() && eventForm.date?.trim()) {
      addEvent(eventForm as Omit<TimelineEvent, 'id'>);
      setEventForm({
        title: '',
        description: '',
        date: '',
        type: 'historical',
        characterIds: [],
        consequences: [],
        relatedEvents: []
      });
      setIsAddingEvent(false);
    }
  };

  const filteredEvents = selectedType === 'all' ? events : getEventsByType(selectedType);

  const getTypeColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'historical':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
      case 'political':
        return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300';
      case 'natural':
        return 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300';
      case 'cultural':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300';
      case 'personal':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300';
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timeline Management
        </h3>
        <Button onClick={() => setIsAddingEvent(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {isAddingEvent && (
        <Card>
          <CardHeader>
            <CardTitle>Add Timeline Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Event title..."
              value={eventForm.title || ''}
              onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
            />
            <Textarea
              placeholder="Event description..."
              value={eventForm.description || ''}
              onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Date (e.g., 1453, Year 203, Spring)"
                value={eventForm.date || ''}
                onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
              />
              <Select
                value={eventForm.type || 'historical'}
                onValueChange={(value: any) => setEventForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="historical">Historical</SelectItem>
                  <SelectItem value="political">Political</SelectItem>
                  <SelectItem value="natural">Natural</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddEvent}>Add Event</Button>
              <Button variant="outline" onClick={() => setIsAddingEvent(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedType === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedType('all')}
        >
          All Events ({events.length})
        </Button>
        {(['historical', 'political', 'natural', 'cultural', 'personal'] as const).map(type => (
          <Button
            key={type}
            variant={selectedType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)} ({getEventsByType(type).length})
          </Button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Timeline Events</h3>
            <p className="text-muted-foreground mb-4">
              {selectedType === 'all' 
                ? 'Start building your world\'s history by adding timeline events.'
                : `No ${selectedType} events found. Try a different filter or add new events.`
              }
            </p>
            <Button onClick={() => setIsAddingEvent(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4">
            {filteredEvents.map(event => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {event.date}
                        </span>
                        {event.characterIds.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event.characterIds.length} characters involved
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge className={getTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{event.description}</p>
                  {event.consequences.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Consequences:</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {event.consequences.map((consequence, index) => (
                          <li key={index}>{consequence}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineManager;
