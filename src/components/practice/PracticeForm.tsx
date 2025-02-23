
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface PracticeFormProps {
  scenario: string;
  onScenarioChange: (value: string) => void;
  nativeLanguage: string;
  onNativeLanguageChange: (value: string) => void;
  targetLanguage: string;
  onTargetLanguageChange: (value: string) => void;
  difficulty: string;
  onDifficultyChange: (value: string) => void;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
}

export const PracticeForm = ({
  scenario,
  onScenarioChange,
  nativeLanguage,
  onNativeLanguageChange,
  targetLanguage,
  onTargetLanguageChange,
  difficulty,
  onDifficultyChange,
  onGenerate,
  isGenerating,
}: PracticeFormProps) => {
  return (
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
            <Select value={nativeLanguage} onValueChange={onNativeLanguageChange}>
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
            <Select value={targetLanguage} onValueChange={onTargetLanguageChange}>
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
              value={scenario}
              onChange={(e) => onScenarioChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Difficulty
            </label>
            <Select value={difficulty} onValueChange={onDifficultyChange}>
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
            onClick={onGenerate}
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
      </div>
    </div>
  );
};
