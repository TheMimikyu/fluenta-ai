
import { Button } from "@/components/ui/button";
import { Minimize2, Play } from "lucide-react";

interface ImageViewerProps {
  imageUrl: string;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  onStartConversation: () => void;
}

export const ImageViewer = ({
  imageUrl,
  isFullScreen,
  onToggleFullScreen,
  onStartConversation,
}: ImageViewerProps) => {
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleFullScreen}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative h-full">
          <img
            src={imageUrl}
            alt="Generated scenario"
            className="absolute inset-0 w-full h-full object-contain"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-full text-lg font-semibold transition-all duration-200 hover:transform hover:scale-105 flex items-center gap-2"
              onClick={onStartConversation}
            >
              <Play className="h-5 w-5" />
              Start Conversation
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="relative rounded-xl overflow-hidden h-[400px]">
        <img
          src={imageUrl}
          alt="Generated scenario"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-full text-lg font-semibold transition-all duration-200 hover:transform hover:scale-105 flex items-center gap-2"
            onClick={onStartConversation}
          >
            <Play className="h-5 w-5" />
            Start Conversation
          </Button>
        </div>
      </div>
    </div>
  );
};
