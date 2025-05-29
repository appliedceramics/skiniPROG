import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eye, EyeOff } from "lucide-react";

interface PasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  description: string;
  correctPassword: string;
}

export function PasswordDialog({ 
  open, 
  onClose, 
  onSuccess, 
  title, 
  description, 
  correctPassword 
}: PasswordDialogProps) {
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (password === correctPassword) {
      setPassword("");
      setError("");
      onSuccess();
      onClose();
    } else {
      setError(t.incorrectPassword);
    }
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="password">{t.password}</Label>
            <div className="relative mt-2">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit();
                  }
                }}
                className="pr-10"
                placeholder={t.enterPassword}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {error && (
              <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
          </div>
          
          <div className="flex items-center justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
            >
              {t.cancel}
            </Button>
            <Button 
              type="button" 
              onClick={handleSubmit}
              disabled={!password.trim()}
            >
              {t.submit}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}