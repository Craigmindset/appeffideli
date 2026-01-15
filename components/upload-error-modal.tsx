"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface UploadErrorModalProps {
  isOpen: boolean;
  error?: string;
  onClose: () => void;
}

export function UploadErrorModal({
  isOpen,
  error,
  onClose,
}: UploadErrorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Upload Failed
          </DialogTitle>
          <DialogDescription className="text-center">
            {error || "An error occurred while uploading the file"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Try Again
          </Button>
          <Button onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
