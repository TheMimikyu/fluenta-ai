
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
import { Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";

const Practice = () => {
  const [language, setLanguage] = useState("");
  const [scenario, setScenario] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // TODO: Implement generation logic
    setTimeout(() => setIsGenerating(false), 2000);
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

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Language
                </label>
                <Select onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
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

            {/* Generated content with scene visualization as background */}
            <div className="mt-8">
              <div className="relative bg-gray-50 rounded-xl overflow-hidden">
                {/* Scene Visualization (Background) */}
                <div className="absolute inset-0 bg-cover bg-center opacity-20" />
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="p-6 backdrop-blur-sm bg-white/30">
                    <h2 className="text-xl font-semibold mb-4">Generated Dialogue</h2>
                    <div className="min-h-40 flex items-center justify-center text-gray-500">
                      Your dialogue will appear here
                    </div>
                  </div>
                  
                  <div className="p-6 backdrop-blur-sm bg-white/30 border-t border-white/20">
                    <h2 className="text-xl font-semibold mb-4">Audio Playback</h2>
                    <div className="h-20 flex items-center justify-center text-gray-500">
                      Audio controls will appear here
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;
