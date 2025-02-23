
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
import { 
  Loader2, 
  BookOpen,
  Clock,
  BrainCircuit,
  AlertTriangle,
  Send
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FlashCard {
  word: string;
  translation: string;
  imageUrl: string;
}

const Practice = () => {
  const [language, setLanguage] = useState("");
  const [scenario, setScenario] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [flipped, setFlipped] = useState<number | null>(null);
  const { user, signOut } = useAuth();

  // Mock flashcards data (replace with real API calls later)
  const [flashcards] = useState<FlashCard[]>([
    {
      word: "Apple",
      translation: "Manzana",
      imageUrl: "https://placeholder.com/apple.jpg"
    },
    {
      word: "Book",
      translation: "Libro",
      imageUrl: "https://placeholder.com/book.jpg"
    },
    {
      word: "Cat",
      translation: "Gato",
      imageUrl: "https://placeholder.com/cat.jpg"
    }
  ]);

  // Mock stats (replace with real PostHog data later)
  const stats = {
    lessonsCompleted: 12,
    timeSpent: "5h 30m",
    accuracyRate: "85%",
    commonErrors: ["Pronunciation", "Grammar"]
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // TODO: Implement generation logic with Mistral
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const handleEmailProgress = async () => {
    // TODO: Implement Make workflow trigger
    console.log("Triggering email workflow");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600 font-bold text-2xl">Fluenta AI</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        <Tabs defaultValue="practice" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="practice">Practice</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
          </TabsList>

          <TabsContent value="practice" className="space-y-8">
            {/* Language Selection Section */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-semibold mb-6">Choose Your Practice</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Language
                  </label>
                  <Select onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
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
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Visual Quiz Section */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-semibold mb-6">Visual Flashcards</h2>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                {flashcards.map((card, index) => (
                  <div
                    key={index}
                    className={`relative h-64 rounded-lg shadow-md cursor-pointer transform transition-transform duration-500 ${
                      flipped === index ? "[transform-style:preserve-3d] [transform:rotateY(180deg)]" : ""
                    }`}
                    onClick={() => setFlipped(flipped === index ? null : index)}
                  >
                    <div className="absolute inset-0 bg-white rounded-lg p-4 flex flex-col items-center justify-center backface-hidden">
                      <img
                        src={card.imageUrl}
                        alt={card.word}
                        className="w-32 h-32 object-cover rounded-lg mb-4"
                      />
                      <h3 className="text-xl font-semibold">{card.word}</h3>
                    </div>
                    <div className="absolute inset-0 bg-blue-50 rounded-lg p-4 flex items-center justify-center [transform:rotateY(180deg)] backface-hidden">
                      <h3 className="text-2xl font-semibold text-blue-600">
                        {card.translation}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Next Cards"
                )}
              </Button>
            </div>

            {/* Tracking & Feedback Section */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-semibold mb-6">Your Progress</h2>
              <div className="grid md:grid-cols-4 gap-6 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Lessons</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{stats.lessonsCompleted}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Time Spent</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{stats.timeSpent}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BrainCircuit className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Accuracy</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{stats.accuracyRate}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Common Errors</h3>
                  </div>
                  <p className="text-sm text-blue-600">{stats.commonErrors.join(", ")}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleEmailProgress}
                className="w-full"
              >
                <Send className="mr-2 h-4 w-4" />
                Email My Progress
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="quiz">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-semibold mb-6">Quiz Section</h2>
              <p className="text-gray-600">Quiz content coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Practice;
