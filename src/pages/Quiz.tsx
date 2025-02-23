
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Clock, 
  BrainCircuit, 
  AlertTriangle,
  Send,
  Loader2
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface FlashCard {
  word: string;
  translation: string;
  imageUrl: string;
}

const Quiz = () => {
  const [flipped, setFlipped] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();

  // Mock flashcards data (replace with real API calls later)
  const [flashcards] = useState<FlashCard[]>([
    {
      word: "Apple",
      translation: "Manzana",
      imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"
    },
    {
      word: "Cat",
      translation: "Gato",
      imageUrl: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1"
    },
    {
      word: "Book",
      translation: "Libro",
      imageUrl: "https://images.unsplash.com/photo-1582562124811-c09040d0a901"
    }
  ]);

  // Mock stats (replace with PostHog data later)
  const stats = {
    lessonsCompleted: 12,
    timeSpent: "5h 30m",
    accuracyRate: "85%",
    commonErrors: ["Pronunciation", "Grammar"]
  };

  const handleNextCards = async () => {
    setIsGenerating(true);
    // TODO: Implement Mistral API call
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const handleEmailProgress = async () => {
    // TODO: Implement Make workflow trigger
    console.log("Triggering email workflow");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <div className="container mx-auto p-8">
        {/* Visual Quiz Section */}
        <div className="glass-card mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Visual Flashcards</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {flashcards.map((card, index) => (
              <div
                key={index}
                className={`relative h-64 rounded-xl overflow-hidden transition-all duration-500 hover:shadow-lg ${
                  flipped === index ? "[transform-style:preserve-3d] [transform:rotateY(180deg)]" : ""
                }`}
                onClick={() => setFlipped(flipped === index ? null : index)}
              >
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm p-4 flex flex-col items-center justify-center backface-hidden">
                  <img
                    src={card.imageUrl}
                    alt={card.word}
                    className="w-32 h-32 object-cover rounded-lg mb-4 shadow-md"
                  />
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {card.word}
                  </h3>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 flex items-center justify-center [transform:rotateY(180deg)] backface-hidden">
                  <h3 className="text-2xl font-bold text-white">
                    {card.translation}
                  </h3>
                </div>
              </div>
            ))}
          </div>
          <Button
            onClick={handleNextCards}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-all duration-300 hover:shadow-lg"
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
        <div className="glass-card animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Learning Progress</h2>
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Lessons</h3>
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {stats.lessonsCompleted}
              </p>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Time Spent</h3>
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {stats.timeSpent}
              </p>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <BrainCircuit className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Accuracy</h3>
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {stats.accuracyRate}
              </p>
            </div>
            <div className="stat-card">
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
            className="w-full hover:bg-blue-50 transition-all duration-300"
          >
            <Send className="mr-2 h-4 w-4" />
            Email My Progress
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
