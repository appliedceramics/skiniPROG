import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Server, Plus, Wifi, WifiOff, Trash2, Home, Download, FileText, Settings } from "lucide-react";
import { AddShareModal } from "./add-share-modal";
import { useSmbShares, useConnectShare, useDisconnectShare, useDeleteShare } from "@/hooks/use-smb";
import { useToast } from "@/hooks/use-toast";
import type { SmbShare } from "@shared/schema";

interface SidebarProps {
  onShareSelect: (share: SmbShare) => void;
  selectedShare: SmbShare | null;
  onSettingsClick?: () => void;
}

export function Sidebar({ onShareSelect, selectedShare, onSettingsClick }: SidebarProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { data: shares = [], isLoading } = useSmbShares();
  const connectShare = useConnectShare();
  const disconnectShare = useDisconnectShare();
  const deleteShare = useDeleteShare();
  const { toast } = useToast();

  const handleConnect = async (share: SmbShare) => {
    try {
      await connectShare.mutateAsync(share.id);
      toast({
        title: "Connected",
        description: `Connected to ${share.name}`,
      });
      onShareSelect(share);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to SMB share",
      });
    }
  };

  const handleDisconnect = async (share: SmbShare) => {
    try {
      await disconnectShare.mutateAsync(share.id);
      toast({
        title: "Disconnected",
        description: `Disconnected from ${share.name}`,
      });
      if (selectedShare?.id === share.id) {
        onShareSelect(null as any);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to disconnect from SMB share",
      });
    }
  };

  const handleDelete = async (share: SmbShare) => {
    try {
      await deleteShare.mutateAsync(share.id);
      toast({
        title: "Deleted",
        description: `${share.name} has been removed`,
      });
      if (selectedShare?.id === share.id) {
        onShareSelect(null as any);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete SMB share",
      });
    }
  };

  const connectedShares = shares.filter(share => share.isConnected);

  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <h1 className="text-lg font-semibold text-slate-800 flex items-center">
          <Server className="text-primary mr-2 h-5 w-5" />
          SMB File Browser
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* SMB Shares Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-slate-700">SMB Shares</h2>
            <Button
              size="sm"
              className="bg-primary text-white hover:bg-blue-600"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Share
            </Button>
          </div>

          {isLoading ? (
            <div className="text-sm text-slate-500">Loading shares...</div>
          ) : shares.length === 0 ? (
            <div className="text-sm text-slate-500">No SMB shares configured</div>
          ) : (
            <div className="space-y-2">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    share.isConnected 
                      ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  } ${selectedShare?.id === share.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => share.isConnected && onShareSelect(share)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <Server className={`mr-2 h-4 w-4 flex-shrink-0 ${
                        share.isConnected ? 'text-green-600' : 'text-slate-400'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-slate-800 truncate">
                          {share.name}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {share.path}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                      {share.isConnected ? (
                        <>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <Wifi className="h-3 w-3" />
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDisconnect(share);
                            }}
                          >
                            <WifiOff className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-slate-400 hover:text-green-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConnect(share);
                            }}
                            disabled={connectShare.isPending}
                          >
                            <Wifi className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-slate-400 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(share);
                            }}
                            disabled={deleteShare.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Access Section */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-slate-700 mb-3">Quick Access</h2>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-slate-600 hover:bg-slate-100"
            >
              <Home className="mr-3 h-4 w-4" />
              Home Directory
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-slate-600 hover:bg-slate-100"
            >
              <Download className="mr-3 h-4 w-4" />
              Downloads
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-slate-600 hover:bg-slate-100"
            >
              <FileText className="mr-3 h-4 w-4" />
              Recent Files
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-slate-600 hover:bg-slate-100"
              onClick={onSettingsClick}
            >
              <Settings className="mr-3 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="p-4 border-t border-slate-200">
        <div className="text-xs text-slate-500">
          <div className="flex items-center justify-between mb-1">
            <span>SMB Version:</span>
            <span className="font-medium">3.1.1</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Active Connections:</span>
            <span className="font-medium">{connectedShares.length}</span>
          </div>
        </div>
      </div>

      <AddShareModal 
        open={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
    </div>
  );
}
