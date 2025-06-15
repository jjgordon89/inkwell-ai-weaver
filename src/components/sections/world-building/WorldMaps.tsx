
import React, { useState } from 'react';
import { Map, Plus, MapPin, Link } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useWorldMaps } from '@/hooks/worldbuilding/useWorldMaps';
import type { WorldLocation } from '@/hooks/worldbuilding/types';

const WorldMaps = () => {
  const {
    worldMaps,
    selectedMap,
    selectedMapId,
    setSelectedMapId,
    addLocation,
    updateLocation,
    deleteLocation,
    addConnection,
    createMap
  } = useWorldMaps();

  const [isAddingMap, setIsAddingMap] = useState(false);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [mapForm, setMapForm] = useState({ name: '', description: '', scale: 'regional' as const });
  const [locationForm, setLocationForm] = useState<Partial<WorldLocation>>({
    name: '',
    description: '',
    type: 'city',
    notableFeatures: [],
    connections: [],
    relatedElements: []
  });

  const handleCreateMap = () => {
    if (mapForm.name.trim()) {
      const newMap = createMap(mapForm);
      setSelectedMapId(newMap.id);
      setMapForm({ name: '', description: '', scale: 'regional' });
      setIsAddingMap(false);
    }
  };

  const handleAddLocation = () => {
    if (selectedMapId && locationForm.name?.trim()) {
      addLocation(selectedMapId, locationForm as Omit<WorldLocation, 'id'>);
      setLocationForm({
        name: '',
        description: '',
        type: 'city',
        notableFeatures: [],
        connections: [],
        relatedElements: []
      });
      setIsAddingLocation(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Map className="h-5 w-5" />
          World Maps
        </h3>
        <Button onClick={() => setIsAddingMap(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Map
        </Button>
      </div>

      {isAddingMap && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Map</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Map name..."
              value={mapForm.name}
              onChange={(e) => setMapForm(prev => ({ ...prev, name: e.target.value }))}
            />
            <Textarea
              placeholder="Map description..."
              value={mapForm.description}
              onChange={(e) => setMapForm(prev => ({ ...prev, description: e.target.value }))}
            />
            <Select
              value={mapForm.scale}
              onValueChange={(value: any) => setMapForm(prev => ({ ...prev, scale: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="regional">Regional</SelectItem>
                <SelectItem value="continental">Continental</SelectItem>
                <SelectItem value="global">Global</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={handleCreateMap}>Create Map</Button>
              <Button variant="outline" onClick={() => setIsAddingMap(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {worldMaps.length > 0 && (
        <div className="space-y-4">
          <Select value={selectedMapId || ''} onValueChange={setSelectedMapId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a map to view..." />
            </SelectTrigger>
            <SelectContent>
              {worldMaps.map(map => (
                <SelectItem key={map.id} value={map.id}>
                  {map.name} ({map.scale})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedMap && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {selectedMap.name}
                  <Button onClick={() => setIsAddingLocation(true)} size="sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    Add Location
                  </Button>
                </CardTitle>
                <CardDescription>{selectedMap.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {isAddingLocation && (
                  <div className="mb-6 p-4 border rounded-lg space-y-3">
                    <h4 className="font-medium">Add New Location</h4>
                    <Input
                      placeholder="Location name..."
                      value={locationForm.name || ''}
                      onChange={(e) => setLocationForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Textarea
                      placeholder="Location description..."
                      value={locationForm.description || ''}
                      onChange={(e) => setLocationForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                    <Select
                      value={locationForm.type || 'city'}
                      onValueChange={(value: any) => setLocationForm(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="city">City</SelectItem>
                        <SelectItem value="region">Region</SelectItem>
                        <SelectItem value="landmark">Landmark</SelectItem>
                        <SelectItem value="building">Building</SelectItem>
                        <SelectItem value="natural">Natural Feature</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button onClick={handleAddLocation}>Add Location</Button>
                      <Button variant="outline" onClick={() => setIsAddingLocation(false)}>Cancel</Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="font-medium">Locations ({selectedMap.locations.length})</h4>
                  {selectedMap.locations.length === 0 ? (
                    <p className="text-muted-foreground">No locations added yet.</p>
                  ) : (
                    <div className="grid gap-3">
                      {selectedMap.locations.map(location => (
                        <div key={location.id} className="border rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium">{location.name}</h5>
                              <p className="text-sm text-muted-foreground mb-2">{location.description}</p>
                              <div className="flex gap-2 flex-wrap">
                                <Badge variant="secondary">{location.type}</Badge>
                                {location.connections.length > 0 && (
                                  <Badge variant="outline">
                                    <Link className="h-3 w-3 mr-1" />
                                    {location.connections.length} connections
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {worldMaps.length === 0 && !isAddingMap && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Map className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No World Maps</h3>
            <p className="text-muted-foreground mb-4">Create your first world map to start organizing locations and their relationships.</p>
            <Button onClick={() => setIsAddingMap(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Map
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorldMaps;
