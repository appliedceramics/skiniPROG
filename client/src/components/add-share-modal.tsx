import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCreateShare } from "@/hooks/use-smb";
import { useToast } from "@/hooks/use-toast";

interface AddShareModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddShareModal({ open, onClose }: AddShareModalProps) {
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [autoConnect, setAutoConnect] = useState(false);
  
  const createShare = useCreateShare();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !path.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    try {
      await createShare.mutateAsync({
        name: name.trim(),
        path: path.trim(),
        username: username.trim() || undefined,
        password: password || undefined,
        autoConnect,
      });
      
      toast({
        title: "Success",
        description: "SMB share added successfully",
      });
      
      // Reset form
      setName("");
      setPath("");
      setUsername("");
      setPassword("");
      setAutoConnect(false);
      
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add SMB share",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add SMB Share</DialogTitle>
          <DialogDescription>
            Connect to a new SMB 3.1.1 network share
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="share-name">Share Name</Label>
            <Input
              id="share-name"
              type="text"
              placeholder="e.g., Production Server"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="share-path">SMB Path</Label>
            <Input
              id="share-path"
              type="text"
              placeholder="//192.168.1.100/shared"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Username (Optional)</Label>
              <Input
                id="username"
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Password (Optional)</Label>
              <Input
                id="password"
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto-connect"
              checked={autoConnect}
              onCheckedChange={(checked) => setAutoConnect(checked as boolean)}
            />
            <Label htmlFor="auto-connect">Auto-connect on startup</Label>
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createShare.isPending}>
              {createShare.isPending ? "Connecting..." : "Connect Share"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
