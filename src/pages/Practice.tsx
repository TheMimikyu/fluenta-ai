
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PracticeNav } from "@/components/practice/PracticeNav";
import { PracticeForm } from "@/components/practice/PracticeForm";
import { ImageViewer } from "@/components/practice/ImageViewer";

const Practice = () => {
  const [targetLanguage, setTargetLanguage] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [scenario, setScenario] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleGenerate = async () => {
    if (!scenario) {
      toast({
        title: "Error",
        description: "Please enter a scenario",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error('No access token available');
      }

      console.log("Starting function invocation with payload:", { scenario });
      
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'generate-image',
        {
          method: 'POST',
          body: { scenario },
        }
      );

      console.log("Function response:", { functionData, functionError });

      if (functionError) {
        console.error("Function error:", functionError);
        throw functionError;
      }

      if (functionData?.imageUrl) {
        console.log("Setting generated image URL:", functionData.imageUrl);
        setGeneratedImage(functionData.imageUrl);
        setIsFullScreen(true);
      } else {
        throw new Error('No image URL received');
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartConversation = () => {
    console.log("Starting conversation...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <PracticeNav onSignOut={handleSignOut} />

      {isFullScreen && generatedImage ? (
        <ImageViewer
          imageUrl={generatedImage}
          isFullScreen={isFullScreen}
          onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
          onStartConversation={handleStartConversation}
        />
      ) : (
        <div className="container mx-auto p-6">
          <PracticeForm
            scenario={scenario}
            onScenarioChange={setScenario}
            nativeLanguage={nativeLanguage}
            onNativeLanguageChange={setNativeLanguage}
            targetLanguage={targetLanguage}
            onTargetLanguageChange={setTargetLanguage}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
          
          {generatedImage && (
            <ImageViewer
              imageUrl={generatedImage}
              isFullScreen={false}
              onToggleFullScreen={() => setIsFullScreen(true)}
              onStartConversation={handleStartConversation}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Practice;
