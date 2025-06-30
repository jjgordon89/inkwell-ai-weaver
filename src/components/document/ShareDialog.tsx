import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { X, Copy, Check, Info, Link, Globe, Lock, Unlock, Users, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { 
  useDocumentPermissions, 
  useUpdateDocumentPermissions,
  useShareDocument,
  useLinkSharing,
  usePublicSharing,
  useTransferOwnership
} from '@/hooks/queries/useDocumentPermissions';
import type { DocumentPermissions } from '@/types/document';
import { sanitizeString } from '@/utils/stringUtils';

interface ShareDialogProps {
  documentId: string;
  documentTitle: string;
  triggerButton?: React.ReactNode;
}

type AccessLevel = 'read' | 'comment' | 'edit' | 'admin';

const ShareDialog: React.FC<ShareDialogProps> = ({ 
  documentId, 
  documentTitle,
  triggerButton 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('read');
  const [activeTab, setActiveTab] = useState('people');
  
  // Query and mutation hooks
  const { data: permissions, isLoading, refetch } = useDocumentPermissions(documentId);
  const { shareWithUser, isSharing } = useShareDocument();
  const { updateLinkSharing, isUpdating: isUpdatingLink } = useLinkSharing();
  const { updatePublicSharing, isUpdating: isUpdatingPublic } = usePublicSharing();
  const { transferOwnership, isTransferring } = useTransferOwnership();
  const { mutateAsync: updatePermissions, isPending: isUpdatingPermissions } = useUpdateDocumentPermissions();
  
  const { toast } = useToast();
  
  // Mock function to get user data in a real app
  const getUserDetails = (userId: string) => {
    // Mock data, in a real app, fetch from your users database
    return {
      id: userId,
      name: userId === permissions?.ownerId ? 'You (Owner)' : `User ${userId.substring(0, 5)}`,
      email: `${userId.substring(0, 5)}@example.com`,
      avatarUrl: `https://i.pravatar.cc/150?u=${userId}`,
    };
  };
  
  // Handler for sharing document with a user
  const handleShareWithUser = async () => {
    if (!email.trim() || !accessLevel) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email and select an access level',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // In a real app, you would lookup the user ID from email
      // This is a mock implementation
      const mockUserId = `user-${Math.random().toString(36).substring(2, 10)}`;
      
      await shareWithUser(documentId, mockUserId, accessLevel);
      
      toast({
        title: 'Success',
        description: `Document shared with ${email}`,
        variant: 'default',
      });
      
      setEmail('');
      refetch();
      
    } catch (error) {
      console.error('Error sharing document:', error);
    }
  };
  
  // Handler for removing a user's access
  const handleRemoveAccess = async (userId: string) => {
    if (!permissions) return;
    
    try {
      const updatedPermissions: DocumentPermissions = {
        ...permissions,
        userPermissions: { ...permissions.userPermissions }
      };
      
      // Remove the user
      delete updatedPermissions.userPermissions[userId];
      
      // Use the update mutation
      await updatePermissions(updatedPermissions);
      
      toast({
        title: 'Success',
        description: 'Access removed successfully',
        variant: 'default',
      });
      
      refetch();
      
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to remove access: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
    }
  };
  
  // Handler for updating a user's access level
  const handleUpdateAccessLevel = async (userId: string, newLevel: AccessLevel) => {
    if (!permissions) return;
    
    try {
      const updatedPermissions: DocumentPermissions = {
        ...permissions,
        userPermissions: { 
          ...permissions.userPermissions,
          [userId]: {
            ...permissions.userPermissions[userId],
            accessLevel: newLevel
          }
        }
      };
      
      // Use the update mutation
      await updatePermissions(updatedPermissions);
      
      toast({
        title: 'Success',
        description: 'Access level updated successfully',
        variant: 'default',
      });
      
      refetch();
      
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update access level: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
    }
  };
  
  // Handler for toggling link sharing
  const handleToggleLinkSharing = async (enabled: boolean) => {
    try {
      await updateLinkSharing(
        documentId,
        enabled,
        permissions?.linkSharing.accessLevel || 'read',
        permissions?.linkSharing.passwordProtected || false
      );
      
      refetch();
      
    } catch (error) {
      console.error('Error toggling link sharing:', error);
    }
  };
  
  // Handler for updating link sharing access level
  const handleUpdateLinkAccessLevel = async (level: AccessLevel) => {
    if (!permissions || !permissions.linkSharing.enabled) return;
    
    try {
      await updateLinkSharing(
        documentId,
        true,
        level,
        permissions.linkSharing.passwordProtected,
        permissions.linkSharing.expiresAt
      );
      
      refetch();
      
    } catch (error) {
      console.error('Error updating link access level:', error);
    }
  };
  
  // Handler for toggling public sharing
  const handleTogglePublicSharing = async (enabled: boolean) => {
    try {
      await updatePublicSharing(
        documentId,
        enabled,
        permissions?.publicSharing.accessLevel || 'read',
        permissions?.publicSharing.allowIndexing || false
      );
      
      refetch();
      
    } catch (error) {
      console.error('Error toggling public sharing:', error);
    }
  };
  
  // Handler for updating public sharing access level
  const handleUpdatePublicAccessLevel = async (level: 'read' | 'comment') => {
    if (!permissions || !permissions.publicSharing.enabled) return;
    
    try {
      await updatePublicSharing(
        documentId,
        true,
        level,
        permissions.publicSharing.allowIndexing
      );
      
      refetch();
      
    } catch (error) {
      console.error('Error updating public access level:', error);
    }
  };
  
  // Handler for toggling search engine indexing
  const handleToggleSearchIndexing = async (allow: boolean) => {
    if (!permissions || !permissions.publicSharing.enabled) return;
    
    try {
      await updatePublicSharing(
        documentId,
        true,
        permissions.publicSharing.accessLevel,
        allow
      );
      
      refetch();
      
    } catch (error) {
      console.error('Error toggling search indexing:', error);
    }
  };
  
  // Copy link to clipboard
  const copyLinkToClipboard = () => {
    if (!permissions?.linkSharing.linkToken) return;
    
    const sharingLink = `${window.location.origin}/share/${permissions.linkSharing.linkToken}`;
    navigator.clipboard.writeText(sharingLink);
    
    toast({
      title: 'Link copied',
      description: 'Sharing link copied to clipboard',
      variant: 'default',
    });
  };
  
  // Get badge color based on access level
  const getAccessLevelBadge = (level: AccessLevel) => {
    switch (level) {
      case 'read':
        return <Badge variant="outline">Read only</Badge>;
      case 'comment':
        return <Badge variant="secondary">Can comment</Badge>;
      case 'edit':
        return <Badge variant="default">Can edit</Badge>;
      case 'admin':
        return <Badge className="bg-purple-500">Admin</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton || <Button variant="outline">Share</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share "{sanitizeString(documentTitle)}"</DialogTitle>
          <DialogDescription>
            Control who can access this document and what they can do with it.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="people" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="people">
              <Users className="h-4 w-4 mr-2" />
              People
            </TabsTrigger>
            <TabsTrigger value="link">
              <Link className="h-4 w-4 mr-2" />
              Link Sharing
            </TabsTrigger>
            <TabsTrigger value="public">
              <Globe className="h-4 w-4 mr-2" />
              Public Access
            </TabsTrigger>
          </TabsList>
          
          {/* People Tab */}
          <TabsContent value="people">
            <Card>
              <CardHeader>
                <CardTitle>Share with people</CardTitle>
                <CardDescription>
                  Invite specific people to collaborate on this document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mb-4">
                  <Input 
                    placeholder="Enter email address" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={accessLevel} onValueChange={(value) => setAccessLevel(value as AccessLevel)}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Access" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Read only</SelectItem>
                      <SelectItem value="comment">Can comment</SelectItem>
                      <SelectItem value="edit">Can edit</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleShareWithUser} 
                    disabled={!email.trim() || isSharing}
                  >
                    Share
                  </Button>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center p-4">Loading...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Access</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Owner Row */}
                      {permissions && (
                        <TableRow>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar>
                                <AvatarImage src={getUserDetails(permissions.ownerId).avatarUrl} />
                                <AvatarFallback>{getUserDetails(permissions.ownerId).name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{getUserDetails(permissions.ownerId).name}</div>
                                <div className="text-xs text-muted-foreground">{getUserDetails(permissions.ownerId).email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-500">Owner</Badge>
                          </TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                        </TableRow>
                      )}
                      
                      {/* Users with permissions */}
                      {permissions && Object.entries(permissions.userPermissions).map(([userId, permission]) => (
                        <TableRow key={userId}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar>
                                <AvatarImage src={getUserDetails(userId).avatarUrl} />
                                <AvatarFallback>{getUserDetails(userId).name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{getUserDetails(userId).name}</div>
                                <div className="text-xs text-muted-foreground">{getUserDetails(userId).email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={permission.accessLevel} 
                              onValueChange={(value) => handleUpdateAccessLevel(userId, value as AccessLevel)}
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue placeholder="Access" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="read">Read only</SelectItem>
                                <SelectItem value="comment">Can comment</SelectItem>
                                <SelectItem value="edit">Can edit</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {permission.accepted ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" />
                                Accepted
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemoveAccess(userId)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {permissions && Object.keys(permissions.userPermissions).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                            No users have been granted access yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Link Sharing Tab */}
          <TabsContent value="link">
            <Card>
              <CardHeader>
                <CardTitle>Link Sharing</CardTitle>
                <CardDescription>
                  Create a link that anyone can use to access this document
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="link-sharing">Link sharing</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          When enabled, anyone with the link can access this document
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Switch 
                    id="link-sharing" 
                    checked={permissions?.linkSharing.enabled || false}
                    onCheckedChange={handleToggleLinkSharing}
                    disabled={isUpdatingLink}
                  />
                </div>
                
                {permissions?.linkSharing.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Access level</Label>
                      <Select 
                        value={permissions.linkSharing.accessLevel} 
                        onValueChange={(value) => handleUpdateLinkAccessLevel(value as AccessLevel)}
                        disabled={isUpdatingLink}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select access level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="read">Read only</SelectItem>
                          <SelectItem value="comment">Can comment</SelectItem>
                          <SelectItem value="edit">Can edit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-4">
                      <div className="flex-1">
                        <Input
                          readOnly
                          value={`${window.location.origin}/share/${permissions.linkSharing.linkToken}`}
                        />
                      </div>
                      <Button variant="outline" onClick={copyLinkToClipboard}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="password-protection">Password protection</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Require a password to access the document via the link
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Switch 
                        id="password-protection" 
                        checked={permissions.linkSharing.passwordProtected}
                        // Add password protection functionality here
                        disabled={true}
                      />
                    </div>
                    
                    <div className="mt-4">
                      <Label>Expiration</Label>
                      <Select disabled={true}>
                        <SelectTrigger>
                          <SelectValue placeholder="Never expires" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="never">Never expires</SelectItem>
                          <SelectItem value="1day">1 day</SelectItem>
                          <SelectItem value="7days">7 days</SelectItem>
                          <SelectItem value="30days">30 days</SelectItem>
                          <SelectItem value="custom">Custom date</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Coming soon: Set an expiration date for the link
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Public Access Tab */}
          <TabsContent value="public">
            <Card>
              <CardHeader>
                <CardTitle>Public Access</CardTitle>
                <CardDescription>
                  Make this document publicly available to anyone on the internet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="public-access">Public access</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          When enabled, anyone can find and access this document without a link
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Switch 
                    id="public-access" 
                    checked={permissions?.publicSharing.enabled || false}
                    onCheckedChange={handleTogglePublicSharing}
                    disabled={isUpdatingPublic}
                  />
                </div>
                
                {permissions?.publicSharing.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Access level</Label>
                      <Select 
                        value={permissions.publicSharing.accessLevel} 
                        onValueChange={(value) => handleUpdatePublicAccessLevel(value as 'read' | 'comment')}
                        disabled={isUpdatingPublic}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select access level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="read">Read only</SelectItem>
                          <SelectItem value="comment">Can comment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="search-indexing">Allow search engines</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Allow search engines to index this document so it can appear in search results
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Switch 
                        id="search-indexing" 
                        checked={permissions.publicSharing.allowIndexing}
                        onCheckedChange={handleToggleSearchIndexing}
                        disabled={isUpdatingPublic}
                      />
                    </div>
                    
                    {permissions.publicSharing.enabled && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <div className="flex">
                          <Shield className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-amber-800 font-medium">
                              This document is publicly available
                            </p>
                            <p className="text-xs text-amber-700 mt-1">
                              Anyone on the internet can access this document at:
                            </p>
                            <code className="text-xs bg-amber-100 p-1 rounded mt-1 block">
                              {`${window.location.origin}/public/${documentId}`}
                            </code>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
