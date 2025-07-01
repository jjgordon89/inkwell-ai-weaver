import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash, 
  Heart, 
  Zap, 
  Target,
  BookOpen,
  User,
  Crown,
  Shield
} from 'lucide-react';
import { useCharacters, type Character } from '@/hooks/character/useCharacters';
import { useCharacterRelationships } from '@/hooks/useCharacterRelationships';

const CharacterManager = () => {
  const { characters, addCharacter, updateCharacter, deleteCharacter } = useCharacters();
  const { relationshipNetwork } = useCharacterRelationships();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [importanceFilter, setImportanceFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [formData, setFormData] = useState<Partial<Character>>({
    name: '',
    role: 'supporting',
    description: '',
    motivations: [],
    flaws: [],
    backstory: '',
    appearance: '',
    personality: [],
    arc: '',
    importance: 'medium',
    status: 'draft',
    tags: []
  });

  // Filter characters
  const filteredCharacters = useMemo(() => {
    return characters.filter((character: Character) => {
      const matchesSearch = character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          character.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || character.role === roleFilter;
      const matchesImportance = importanceFilter === 'all' || character.importance === importanceFilter;
      
      return matchesSearch && matchesRole && matchesImportance;
    });
  }, [characters, searchQuery, roleFilter, importanceFilter]);

  // Character statistics
  const stats = useMemo(() => {
    const total = characters.length;
    const byRole = characters.reduce((acc: Record<string, number>, char: Character) => {
      acc[char.role] = (acc[char.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byImportance = characters.reduce((acc: Record<string, number>, char: Character) => {
      acc[char.importance] = (acc[char.importance] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageDevelopment = total > 0 
      ? characters.reduce((sum: number, char: Character) => sum + char.development, 0) / total 
      : 0;

    return { total, byRole, byImportance, averageDevelopment };
  }, [characters]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCharacter) {
      updateCharacter({
        ...editingCharacter,
        ...formData,
        updatedAt: new Date()
      });
    } else {
      addCharacter({
        ...formData,
        id: `char_${Date.now()}`,
        development: 0,
        relationships: [],
        scenes: [],
        createdAt: new Date(),
        updatedAt: new Date()
      } as Character);
    }

    setFormData({
      name: '',
      role: 'supporting',
      description: '',
      motivations: [],
      flaws: [],
      backstory: '',
      appearance: '',
      personality: [],
      arc: '',
      importance: 'medium',
      status: 'draft',
      tags: []
    });
    setEditingCharacter(null);
    setShowForm(false);
  };

  const handleEdit = (character: Character) => {
    setFormData(character);
    setEditingCharacter(character);
    setShowForm(true);
  };

  const getRoleIcon = (role: Character['role']) => {
    switch (role) {
      case 'protagonist': return <Crown className="h-4 w-4" />;
      case 'antagonist': return <Zap className="h-4 w-4" />;
      case 'supporting': return <Users className="h-4 w-4" />;
      case 'minor': return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: Character['role']) => {
    switch (role) {
      case 'protagonist': return 'bg-yellow-100 text-yellow-800';
      case 'antagonist': return 'bg-red-100 text-red-800';
      case 'supporting': return 'bg-blue-100 text-blue-800';
      case 'minor': return 'bg-gray-100 text-gray-800';
    }
  };

  const getImportanceColor = (importance: Character['importance']) => {
    switch (importance) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
    }
  };

  return (
    <div className="h-full flex flex-col bg-background p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Character Management</h2>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Character
        </Button>
      </div>

      <Tabs defaultValue="overview" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
          <TabsTrigger value="arcs">Character Arcs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex-1 space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Characters</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Protagonists</p>
                    <p className="text-2xl font-bold">{stats.byRole.protagonist || 0}</p>
                  </div>
                  <Crown className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Development</p>
                    <p className="text-2xl font-bold">{Math.round(stats.averageDevelopment)}%</p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                    <p className="text-2xl font-bold">{stats.byImportance.high || 0}</p>
                  </div>
                  <Shield className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Character List</CardTitle>
              <CardDescription>Manage your story characters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search characters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="protagonist">Protagonist</SelectItem>
                    <SelectItem value="antagonist">Antagonist</SelectItem>
                    <SelectItem value="supporting">Supporting</SelectItem>
                    <SelectItem value="minor">Minor</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={importanceFilter} onValueChange={setImportanceFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by importance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Importance</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Character Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCharacters.map((character: Character) => (
                  <Card key={character.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`/avatars/${character.id}.png`} />
                            <AvatarFallback>
                              {character.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{character.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getRoleColor(character.role)}>
                                <div className="flex items-center gap-1">
                                  {getRoleIcon(character.role)}
                                  {character.role}
                                </div>
                              </Badge>
                              <div className={`w-2 h-2 rounded-full ${getImportanceColor(character.importance)}`} />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(character)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteCharacter(character.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {character.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Character Development</span>
                          <span>{character.development}%</span>
                        </div>
                        <Progress value={character.development} className="h-2" />
                      </div>

                      {character.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {character.tags.slice(0, 3).map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {character.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{character.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredCharacters.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No characters found matching your criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Character Gallery</CardTitle>
              <CardDescription>Visual overview of all characters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {characters.map((character) => (
                  <div key={character.id} className="text-center space-y-2">
                    <Avatar className="w-20 h-20 mx-auto">
                      <AvatarImage src={`/avatars/${character.id}.png`} />
                      <AvatarFallback className="text-lg">
                        {character.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{character.name}</p>
                      <Badge className={`${getRoleColor(character.role)} text-xs`}>
                        {character.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relationships" className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Character Relationships</CardTitle>
              <CardDescription>Visualize connections between characters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Relationship visualization will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arcs" className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Character Development Arcs</CardTitle>
              <CardDescription>Track character growth throughout your story</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {characters.filter(char => char.arc).map((character) => (
                  <div key={character.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{character.name}</h4>
                      <Progress value={character.development} className="w-32 h-2" />
                    </div>
                    <p className="text-sm text-muted-foreground">{character.arc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Character Form Modal/Dialog would go here */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingCharacter ? 'Edit Character' : 'Add New Character'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value as Character['role']})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="protagonist">Protagonist</SelectItem>
                        <SelectItem value="antagonist">Antagonist</SelectItem>
                        <SelectItem value="supporting">Supporting</SelectItem>
                        <SelectItem value="minor">Minor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Backstory</label>
                  <Textarea
                    value={formData.backstory}
                    onChange={(e) => setFormData({...formData, backstory: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Importance</label>
                    <Select value={formData.importance} onValueChange={(value) => setFormData({...formData, importance: value as Character['importance']})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as Character['status']})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => {
                    setShowForm(false);
                    setEditingCharacter(null);
                    setFormData({
                      name: '',
                      role: 'supporting',
                      description: '',
                      motivations: [],
                      flaws: [],
                      backstory: '',
                      appearance: '',
                      personality: [],
                      arc: '',
                      importance: 'medium',
                      status: 'draft',
                      tags: []
                    });
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCharacter ? 'Update' : 'Create'} Character
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CharacterManager;
