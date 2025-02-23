
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";

interface FlashCard {
  word: string;
  translation: string;
  imageUrl: string;
}

const Quiz = () => {
  const [flipped, setFlipped] = useState<number | null>(null);
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

  const handleNextCards = async () => {
    setIsGenerating(true);
    // TODO: Implement Mistral API call
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
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
              <span className="text-blue-600 font-bold text-2xl">Quiz</span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/practice")}
              >
                Practice
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
      </div>
    </div>
  );
};

export default Quiz;
