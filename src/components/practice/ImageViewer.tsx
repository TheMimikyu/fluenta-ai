
import { Button } from "@/components/ui/button";
import { Minimize2, Play, Square } from "lucide-react";
import { useConversationAI } from "@/hooks/useConversationAI";

interface ImageViewerProps {
  imageUrl: string;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  scenario: string;
  targetLanguage: string;
}

export const ImageViewer = ({
  imageUrl,
  isFullScreen,
  onToggleFullScreen,
  scenario,
  targetLanguage,
}: ImageViewerProps) => {
  const { status, startConversation, endConversation } = useConversationAI();

  const handleStartConversation = async () => {
    try {
      await startConversation(scenario, targetLanguage);
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const isActive = status === 'connected' || status === 'connecting';

  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          {isActive && (
            <Button
              variant="outline"
              size="icon"
              onClick={endConversation}
              className="bg-red-500/10 hover:bg-red-500/20 text-white border-red-500/20"
            >
              <Square className="h-4 w-4" />
            </Button>
          )}
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
            {!isActive && (
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-full text-lg font-semibold transition-all duration-200 hover:transform hover:scale-105 flex items-center gap-2"
                onClick={handleStartConversation}
              >
                <Play className="h-5 w-5" />
                Start Conversation
              </Button>
            )}
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
          {!isActive && (
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-full text-lg font-semibold transition-all duration-200 hover:transform hover:scale-105 flex items-center gap-2"
              onClick={handleStartConversation}
            >
              <Play className="h-5 w-5" />
              Start Conversation
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
