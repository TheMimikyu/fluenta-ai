import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Play } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { fal } from "@/config/fal";
import { useToast } from "@/components/ui/use-toast";

const Practice = () => {
  const [targetLanguage, setTargetLanguage] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [scenario, setScenario] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>("");
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
      console.log("Starting image generation...");
      const result = await fal.subscribe("fal-ai/flux-lora", {
        input: {
          prompt: `Realistic scene of ${scenario}, photographic style, detailed environment, natural lighting`,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });

      if (result.data.images?.[0]?.url) {
        setGeneratedImage(result.data.images[0].url);
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Error",
        description: "Failed to generate image. Please check your API key configuration.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Button>
              <span className="text-blue-600 font-bold text-2xl">Practice</span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/quiz")}
              >
                Quiz
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/tracking")}
              >
                Progress
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-8 animate-in">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Language Practice
            </h1>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Native Language
                </label>
                <Select onValueChange={setNativeLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your native language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Target Language
                </label>
                <Select onValueChange={setTargetLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Scenario
                </label>
                <Input
                  placeholder="Type scenario (e.g., job interview)"
                  onChange={(e) => setScenario(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Difficulty
                </label>
                <Select onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-full text-lg font-semibold transition-all duration-200 hover:transform hover:scale-105"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Scenario"
                )}
              </Button>
            </div>

            {/* Generated Scene Visualization */}
            {generatedImage && (
              <div className="mt-8">
                <div className="relative rounded-xl overflow-hidden h-[400px]">
                  {/* Background Image */}
                  <img
                    src={generatedImage}
                    alt="Generated scenario"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Overlay with Start Button */}
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
                    <Button
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-full text-lg font-semibold transition-all duration-200 hover:transform hover:scale-105 flex items-center gap-2"
                      onClick={() => {
                        // TODO: Implement conversation start logic
                        console.log("Starting conversation...");
                      }}
                    >
                      <Play className="h-5 w-5" />
                      Start Conversation
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;
