import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  Loader2,
  Trophy,
  Target,
  Zap,
  Filter,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface MCQQuestion {
  id: string;
  subject_id: string;
  unit_id: string | null;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  explanation: string | null;
  difficulty: "easy" | "medium" | "hard";
}

interface Unit {
  id: string;
  number: number;
  name: string;
}

interface MCQPracticeProps {
  subjectId: string;
  subjectName: string;
  units?: Unit[];
}

type QuizState = "setup" | "quiz" | "result";

export const MCQPractice = ({ subjectId, subjectName, units = [] }: MCQPracticeProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [quizState, setQuizState] = useState<QuizState>("setup");
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Array<{ questionId: string; selected: string; correct: boolean }>>([]);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  // Filters
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("mcq_questions")
        .select("*")
        .eq("subject_id", subjectId);

      if (selectedUnit !== "all") {
        query = query.eq("unit_id", selectedUnit);
      }

      if (selectedDifficulty !== "all") {
        query = query.eq("difficulty", selectedDifficulty);
      }

      const { data, error } = await query.order("created_at");

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "No questions found",
          description: "No MCQ questions available for the selected filters.",
          variant: "destructive",
        });
        return;
      }

      // Shuffle questions
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setQuestions(shuffled as MCQQuestion[]);
      setQuizState("quiz");
      setCurrentIndex(0);
      setScore(0);
      setAnswers([]);
      setSelectedOption(null);
      setIsAnswered(false);
      setStartTime(Date.now());
    } catch (error) {
      console.error("Error fetching MCQs:", error);
      toast({
        title: "Error",
        description: "Failed to load questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const handleCheckAnswer = async () => {
    if (!selectedOption || isAnswered) return;

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedOption === currentQuestion.correct_option;

    setIsAnswered(true);
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setAnswers((prev) => [
      ...prev,
      { questionId: currentQuestion.id, selected: selectedOption, correct: isCorrect },
    ]);

    // Save attempt to database if user is logged in
    if (user) {
      const timeTaken = startTime ? Math.round((Date.now() - startTime) / 1000) : null;
      try {
        await supabase.from("user_mcq_attempts").insert({
          user_id: user.id,
          mcq_question_id: currentQuestion.id,
          selected_option: selectedOption,
          is_correct: isCorrect,
          time_taken_seconds: timeTaken,
        });
      } catch (error) {
        console.error("Error saving attempt:", error);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setStartTime(Date.now());
    } else {
      setQuizState("result");
    }
  };

  const handleRestart = () => {
    setQuizState("setup");
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setAnswers([]);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  const getOptionClass = (option: string) => {
    const baseClass = "w-full p-4 text-left border rounded-lg transition-all duration-200 ";
    
    if (!isAnswered) {
      if (selectedOption === option) {
        return baseClass + "border-primary bg-primary/10 ring-2 ring-primary";
      }
      return baseClass + "border-border hover:border-primary/50 hover:bg-muted/50";
    }

    const currentQuestion = questions[currentIndex];
    if (option === currentQuestion.correct_option) {
      return baseClass + "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300";
    }
    if (selectedOption === option && option !== currentQuestion.correct_option) {
      return baseClass + "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300";
    }
    return baseClass + "border-border opacity-60";
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">Easy</Badge>;
      case "medium":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">Medium</Badge>;
      case "hard":
        return <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">Hard</Badge>;
      default:
        return null;
    }
  };

  const progressPercentage = questions.length > 0 
    ? ((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100 
    : 0;

  // Setup Screen
  if (quizState === "setup") {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">MCQ Practice</CardTitle>
              <p className="text-sm text-muted-foreground">{subjectName}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Configure Your Quiz</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Filter by Unit</label>
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Units" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Units</SelectItem>
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        Unit {unit.number}: {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Difficulty Level</label>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={fetchQuestions} 
              className="w-full mt-4" 
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading...</>
              ) : (
                <><Zap className="h-4 w-4 mr-2" /> Start Quiz</>
              )}
            </Button>
          </div>

          {!user && (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Sign in to track your progress and save your attempts.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Result Screen
  if (quizState === "result") {
    const percentage = Math.round((score / questions.length) * 100);
    const getMessage = () => {
      if (percentage >= 90) return { text: "Excellent! 🎉", color: "text-green-600" };
      if (percentage >= 70) return { text: "Great job! 👍", color: "text-blue-600" };
      if (percentage >= 50) return { text: "Good effort! 💪", color: "text-yellow-600" };
      return { text: "Keep practicing! 📚", color: "text-orange-600" };
    };
    const message = getMessage();

    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Quiz Complete!</CardTitle>
              <p className="text-sm text-muted-foreground">{subjectName}</p>
            </div>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1">
          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10">
                <span className="text-3xl font-bold text-primary">{percentage}%</span>
              </div>
              <div>
                <p className={`text-xl font-semibold ${message.color}`}>{message.text}</p>
                <p className="text-muted-foreground">
                  You scored {score} out of {questions.length}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Summary</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{score}</p>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{questions.length - score}</p>
                  <p className="text-xs text-muted-foreground">Incorrect</p>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{questions.length}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </div>

            <Button onClick={handleRestart} className="w-full" size="lg">
              <RotateCcw className="h-4 w-4 mr-2" /> Try Again
            </Button>
          </CardContent>
        </ScrollArea>
      </Card>
    );
  }

  // Quiz Screen
  const currentQuestion = questions[currentIndex];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {currentIndex + 1} / {questions.length}
            </Badge>
            {getDifficultyBadge(currentQuestion.difficulty)}
          </div>
          <div className="text-sm text-muted-foreground">
            Score: {score}
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2 mt-2" />
      </CardHeader>

      <ScrollArea className="flex-1">
        <CardContent className="p-4 space-y-4">
          {/* Question */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-foreground font-medium leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {["A", "B", "C", "D"].map((option) => {
              const optionText = currentQuestion[`option_${option.toLowerCase()}` as keyof MCQQuestion] as string;
              return (
                <button
                  key={option}
                  onClick={() => handleOptionSelect(option)}
                  className={getOptionClass(option)}
                  disabled={isAnswered}
                >
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-sm font-medium">
                      {option}
                    </span>
                    <span className="flex-1 text-sm">{optionText}</span>
                    {isAnswered && option === currentQuestion.correct_option && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    )}
                    {isAnswered && selectedOption === option && option !== currentQuestion.correct_option && (
                      <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {isAnswered && currentQuestion.explanation && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Explanation</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">{currentQuestion.explanation}</p>
            </div>
          )}
        </CardContent>
      </ScrollArea>

      {/* Action Buttons */}
      <div className="p-4 border-t shrink-0">
        {!isAnswered ? (
          <Button 
            onClick={handleCheckAnswer} 
            className="w-full" 
            disabled={!selectedOption}
          >
            Check Answer
          </Button>
        ) : (
          <Button onClick={handleNextQuestion} className="w-full">
            {currentIndex < questions.length - 1 ? (
              <>Next Question <ChevronRight className="h-4 w-4 ml-1" /></>
            ) : (
              <>View Results <Trophy className="h-4 w-4 ml-1" /></>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
};
