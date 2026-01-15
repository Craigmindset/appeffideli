"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import lottie from "lottie-web";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface UploadSuccessModalProps {
  isOpen: boolean;
  fileName?: string;
  onClose: () => void;
}

export function UploadSuccessModal({
  isOpen,
  fileName,
  onClose,
}: UploadSuccessModalProps) {
  const animationContainer = useRef<HTMLDivElement>(null);
  const animationInstance = useRef<any>(null);
  const [animationError, setAnimationError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && animationContainer.current && !animationError) {
      try {
        // Destroy previous animation if it exists
        if (animationInstance.current) {
          animationInstance.current.destroy();
          animationInstance.current = null;
        }

        console.log("Loading Lottie animation from /success.json");

        // Load and play the success animation
        animationInstance.current = lottie.loadAnimation({
          container: animationContainer.current,
          renderer: "svg",
          loop: true,
          autoplay: true,
          path: "/success.json",
        });

        animationInstance.current.addEventListener("error", () => {
          console.error("Lottie animation error");
          setAnimationError(true);
        });

        animationInstance.current.addEventListener("complete", () => {
          console.log("Lottie animation completed");
        });

        animationInstance.current.addEventListener("loopComplete", () => {
          console.log("Lottie animation loop completed");
        });
      } catch (error) {
        console.error("Error loading Lottie animation:", error);
        setAnimationError(true);
      }
    }

    return () => {
      if (animationInstance.current) {
        animationInstance.current.destroy();
        animationInstance.current = null;
      }
    };
  }, [isOpen, animationError]);

  // Reset animation error when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAnimationError(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-green-600">
            Upload Successful! 🎉
          </DialogTitle>
          <DialogDescription className="text-center">
            {fileName && `${fileName} has been successfully uploaded`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          {!animationError ? (
            <div ref={animationContainer} className="w-32 h-32" />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center">
              <CheckCircle2 className="w-32 h-32 text-green-600" />
            </div>
          )}
          <Button
            onClick={() => {
              onClose();
              router.push("/admin/uploads/my-download");
            }}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            View Uploaded File
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
