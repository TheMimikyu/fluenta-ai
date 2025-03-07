
import { Button } from "@/components/ui/button";
import { Loader2, Minimize2, Play, Square } from "lucide-react";
import { useConversationAI } from "@/hooks/useConversationAI";
import { useEffect } from "react";

interface ImageViewerProps {
  imageUrl: string;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  scenario: string;
  targetLanguage: string;
  difficulty: string;
  nativeLanguage: string;
}

export const ImageViewer = ({
  imageUrl,
  isFullScreen,
  onToggleFullScreen,
  scenario,
  targetLanguage,
  difficulty,
  nativeLanguage,
}: ImageViewerProps) => {
  const { status, isSpeaking, conversationId, startConversation, endConversation } = useConversationAI();

  const handleStartConversation = async () => {
    try {
      console.log("Starting conversation...");
      await startConversation(scenario, targetLanguage, difficulty, nativeLanguage);
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  // Log when conversation ID is available
  useEffect(() => {
    if (conversationId) {
      console.log(`Conversation ID available in component: ${conversationId}`);
    }
  }, [conversationId]);

  const isActive = status === 'connected' || status === 'connecting';
  const isConnecting = status === 'connecting';

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
            {isConnecting && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
                <p className="text-white text-lg font-medium">Connecting to conversation service...</p>
              </div>
            )}
            {isSpeaking && status === 'connected' && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="bg-blue-500/80 text-white px-4 py-2 rounded-full animate-pulse">
                  AI Speaking...
                </div>
              </div>
            )}
            {conversationId && status === 'connected' && (
              <div className="absolute top-6 left-6 text-xs bg-white/20 text-white/80 px-2 py-1 rounded">
                Conversation ID: {conversationId}
              </div>
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
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Start Conversation
                </>
              )}
            </Button>
          )}
          {conversationId && status === 'connected' && (
            <div className="absolute top-2 left-2 text-xs bg-white/20 text-white/80 px-2 py-1 rounded">
              Conversation active
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
