
import { useState } from 'react';
import type { WorldLocation, WorldMap } from './types';

export const useWorldMaps = () => {
  const [worldMaps, setWorldMaps] = useState<WorldMap[]>([]);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);

  const addLocation = (mapId: string, location: Omit<WorldLocation, 'id'>) => {
    const newLocation: WorldLocation = {
      ...location,
      id: crypto.randomUUID()
    };

    setWorldMaps(prev => prev.map(map => 
      map.id === mapId 
        ? { ...map, locations: [...map.locations, newLocation] }
        : map
    ));

    return newLocation;
  };

  const updateLocation = (mapId: string, locationId: string, updates: Partial<WorldLocation>) => {
    setWorldMaps(prev => prev.map(map => 
      map.id === mapId 
        ? {
            ...map,
            locations: map.locations.map(loc => 
              loc.id === locationId ? { ...loc, ...updates } : loc
            )
          }
        : map
    ));
  };

  const deleteLocation = (mapId: string, locationId: string) => {
    setWorldMaps(prev => prev.map(map => 
      map.id === mapId 
        ? { ...map, locations: map.locations.filter(loc => loc.id !== locationId) }
        : map
    ));
  };

  const addConnection = (mapId: string, locationId1: string, locationId2: string) => {
    setWorldMaps(prev => prev.map(map => 
      map.id === mapId 
        ? {
            ...map,
            locations: map.locations.map(loc => {
              if (loc.id === locationId1) {
                return { ...loc, connections: [...loc.connections, locationId2] };
              }
              if (loc.id === locationId2) {
                return { ...loc, connections: [...loc.connections, locationId1] };
              }
              return loc;
            })
          }
        : map
    ));
  };

  const createMap = (mapData: Omit<WorldMap, 'id' | 'locations'>) => {
    const newMap: WorldMap = {
      ...mapData,
      id: crypto.randomUUID(),
      locations: []
    };
    setWorldMaps(prev => [...prev, newMap]);
    return newMap;
  };

  const selectedMap = worldMaps.find(map => map.id === selectedMapId);

  return {
    worldMaps,
    selectedMap,
    selectedMapId,
    setSelectedMapId,
    addLocation,
    updateLocation,
    deleteLocation,
    addConnection,
    createMap
  };
};
