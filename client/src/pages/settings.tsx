import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Home, Settings, Folder, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import gepardLogo from "@assets/gepard-192.png";
import { Link } from "wouter";

interface SmbShareForm {
  name: string;
  path: string;
  username: string;
  password: string;
}

export default function SettingsPage() {
  const [defaultMyFilesPath, setDefaultMyFilesPath] = useState("//test");
  const [uploadPassword, setUploadPassword] = useState("$isak044");
  const [adminPassword, setAdminPassword] = useState("Hfix4ACC");
  const [showUploadPassword, setShowUploadPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [newSmbShare, setNewSmbShare] = useState<SmbShareForm>({
    name: "",
    path: "",
    username: "",
    password: ""
  });
  const [showSmbPassword, setShowSmbPassword] = useState(false);
  const [smbShares, setSmbShares] = useState([
    { id: 1, name: "Test Server", path: "//test", username: "", password: "" }
  ]);
  
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "All settings have been updated successfully.",
    });
  };

  const handleAddSmbShare = () => {
    if (!newSmbShare.name || !newSmbShare.path) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please fill in at least the name and path fields.",
      });
      return;
    }

    const newShare = {
      id: Date.now(),
      ...newSmbShare
    };
    
    setSmbShares([...smbShares, newShare]);
    setNewSmbShare({ name: "", path: "", username: "", password: "" });
    
    toast({
      title: "SMB Share Added",
      description: `Added ${newSmbShare.name} successfully.`,
    });
  };

  const handleDeleteSmbShare = (id: number) => {
    setSmbShares(smbShares.filter(share => share.id !== id));
    toast({
      title: "SMB Share Removed",
      description: "Share has been deleted successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center">
              <img 
                src={gepardLogo} 
                alt="skiniPROG Logo" 
                className="w-13 h-13 object-contain"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold">
                <span className="italic text-blue-600">skini</span>
                <span className="text-gray-800">PROG</span>
              </h1>
              <p className="text-xs text-gray-500">CNC Program Fetcher</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            <Link href="/">
              <div className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                <Home className="h-4 w-4 mr-3" />
                My Files
              </div>
            </Link>
            <div className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded cursor-pointer">
              <Settings className="h-4 w-4 mr-3" />
              Settings
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
          <p className="text-sm text-gray-600">Configure your CNC Program Fetcher preferences</p>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl space-y-6">
            
            {/* Language Settings */}
            <Card>
              <CardHeader>
                <CardTitle>{t.language}</CardTitle>
                <CardDescription>
                  Choose your preferred language for the interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="language-select">{t.language}</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hr">Hrvatski (Croatian)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            {/* My Files Path Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Default My Files Location</CardTitle>
                <CardDescription>
                  Set the default path for the "My Files" section
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="my-files-path">Path</Label>
                  <Input
                    id="my-files-path"
                    value={defaultMyFilesPath}
                    onChange={(e) => setDefaultMyFilesPath(e.target.value)}
                    placeholder="//localhost/myfiles"
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Password Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure passwords for upload and folder creation operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-[transparent]">
                  <Label htmlFor="admin-password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#cb2233]">Administrator Password</Label>
                  <div className="relative mt-2">
                    <Input
                      id="admin-password"
                      type={showAdminPassword ? "text" : "password"}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                    >
                      {showAdminPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This password is required to access the Settings page
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="upload-password">Upload & New Folder Password</Label>
                  <div className="relative mt-2">
                    <Input
                      id="upload-password"
                      type={showUploadPassword ? "text" : "password"}
                      value={uploadPassword}
                      onChange={(e) => setUploadPassword(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowUploadPassword(!showUploadPassword)}
                    >
                      {showUploadPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This password will be required for uploading files and creating new folders
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* SMB Shares Management */}
            <Card>
              <CardHeader>
                <CardTitle>SMB Shares</CardTitle>
                <CardDescription>
                  Manage your SMB network shares
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Existing Shares */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Current Shares</h4>
                  <div className="space-y-2">
                    {smbShares.map((share) => (
                      <div key={share.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Folder className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">{share.name}</p>
                            <p className="text-xs text-gray-500">{share.path}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSmbShare(share.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Add New Share */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Add New SMB Share</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="share-name">Share Name</Label>
                      <Input
                        id="share-name"
                        value={newSmbShare.name}
                        onChange={(e) => setNewSmbShare({...newSmbShare, name: e.target.value})}
                        placeholder="Production Server"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="share-path">Share Path</Label>
                      <Input
                        id="share-path"
                        value={newSmbShare.path}
                        onChange={(e) => setNewSmbShare({...newSmbShare, path: e.target.value})}
                        placeholder="//192.168.1.100/share"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="share-username">Username (optional)</Label>
                      <Input
                        id="share-username"
                        value={newSmbShare.username}
                        onChange={(e) => setNewSmbShare({...newSmbShare, username: e.target.value})}
                        placeholder="username"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="share-password">Password (optional)</Label>
                      <div className="relative mt-1">
                        <Input
                          id="share-password"
                          type={showSmbPassword ? "text" : "password"}
                          value={newSmbShare.password}
                          onChange={(e) => setNewSmbShare({...newSmbShare, password: e.target.value})}
                          placeholder="password"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowSmbPassword(!showSmbPassword)}
                        >
                          {showSmbPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleAddSmbShare} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add SMB Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} className="px-8">
                Save All Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}