import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { QuizSettingsForm } from "@/components/quiz/QuizSettings";
import { QuizBannerUpload } from "@/components/quiz/QuizBannerUpload";
import { QuizScheduler } from "@/components/quiz/QuizScheduler";
import { QuizBulkImport } from "@/components/quiz/QuizBulkImport";
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit,
  Trophy,
  Check,
  Loader2,
  Gamepad2,
  Code,
  Image
} from "lucide-react";

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
  time_limit_seconds: number;
  points: number;
}

interface QuizSettings {
  autoAdvance: boolean;
  countdownSeconds: number;
  answerRevealSeconds: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showLiveLeaderboard: boolean;
  allowLateJoin: boolean;
}

const STEPS = ["Basic Info", "Questions", "Settings", "Prizes"];

export default function CreateQuiz() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);

  // Step 1: Basic Info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [difficulty, setDifficulty] = useState("medium");
  const [isPublic, setIsPublic] = useState(true);
  const [maxParticipants, setMaxParticipants] = useState("100");
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [customCode, setCustomCode] = useState("");
  const [scheduledStart, setScheduledStart] = useState<Date | null>(null);
  const [registrationOpen, setRegistrationOpen] = useState(true);

  // Step 2: Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState(0);
  const [timeLimit, setTimeLimit] = useState(30);
  const [points, setPoints] = useState(10);
  const [showBulkImport, setShowBulkImport] = useState(false);

  // Step 3: Settings
  const [settings, setSettings] = useState<QuizSettings>({
    autoAdvance: true,
    countdownSeconds: 5,
    answerRevealSeconds: 3,
    shuffleQuestions: false,
    shuffleOptions: false,
    showLiveLeaderboard: true,
    allowLateJoin: false,
  });

  // Step 4: Prizes
  const [prizes, setPrizes] = useState({
    first: "",
    second: "",
    third: "",
  });

  const addQuestion = () => {
    if (!questionText.trim()) return;
    const validOptions = options.filter((o) => o.trim());
    if (validOptions.length < 2) {
      toast({ title: "Error", description: "At least 2 options required", variant: "destructive" });
      return;
    }

    const newQuestion: Question = {
      id: crypto.randomUUID(),
      question_text: questionText.trim(),
      options: validOptions,
      correct_option_index: correctOption,
      time_limit_seconds: timeLimit,
      points: points,
    };

    if (editingQuestion) {
      setQuestions((prev) => prev.map((q) => (q.id === editingQuestion.id ? newQuestion : q)));
      setEditingQuestion(null);
    } else {
      setQuestions((prev) => [...prev, newQuestion]);
    }

    // Reset form
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectOption(0);
    setTimeLimit(30);
    setPoints(10);
  };

  const editQuestion = (question: Question) => {
    setEditingQuestion(question);
    setQuestionText(question.question_text);
    const opts = [...question.options];
    while (opts.length < 4) opts.push("");
    setOptions(opts);
    setCorrectOption(question.correct_option_index);
    setTimeLimit(question.time_limit_seconds);
    setPoints(question.points);
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return title.trim().length >= 3;
      case 1:
        return questions.length >= 1;
      case 2:
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleBulkImport = (importedQuestions: Question[]) => {
    setQuestions((prev) => [...prev, ...importedQuestions]);
    setShowBulkImport(false);
  };

  const createQuiz = async () => {
    setIsCreating(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Please sign in to create a quiz");

      // Get user's display name
      const { data: profile } = await supabase
        .from("student_profiles")
        .select("full_name")
        .eq("user_id", user.user.id)
        .maybeSingle();

      // Create quiz with new fields
      const quizInsertData: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || null,
        created_by: user.user.id,
        is_public: isPublic,
        organizer_name: profile?.full_name || "Anonymous",
        category,
        difficulty,
        max_participants: parseInt(maxParticipants) || null,
        auto_advance: settings.autoAdvance,
        countdown_seconds: settings.countdownSeconds,
        answer_reveal_seconds: settings.answerRevealSeconds,
        shuffle_questions: settings.shuffleQuestions,
        shuffle_options: settings.shuffleOptions,
        show_live_leaderboard: settings.showLiveLeaderboard,
        allow_late_join: settings.allowLateJoin,
        prizes: prizes.first || prizes.second || prizes.third ? prizes : null,
        // New fields
        banner_image: bannerImage,
        custom_code: customCode.trim().toUpperCase() || null,
        scheduled_start: scheduledStart?.toISOString() || null,
        registration_open: registrationOpen,
      };

      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .insert([quizInsertData as any])
        .select()
        .single();

      if (quizError) throw quizError;

      // Add questions
      if (questions.length > 0) {
        const questionsToInsert = questions.map((q, idx) => ({
          quiz_id: quiz.id,
          question_text: q.question_text,
          options: q.options,
          correct_option_index: q.correct_option_index,
          time_limit_seconds: q.time_limit_seconds,
          points: q.points,
          order_index: idx,
        }));

        const { error: questionsError } = await supabase
          .from("quiz_questions")
          .insert(questionsToInsert);

        if (questionsError) throw questionsError;
      }

      toast({
        title: "Quiz created! 🎉",
        description: `Your quiz code is: ${quiz.quiz_code}`,
      });

      navigate(`/my-quizzes`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create quiz";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-primary/5 py-6">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <Gamepad2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">Create Your Quiz</h1>
          </div>
          <p className="text-muted-foreground">Host engaging quizzes for your community</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((step, idx) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  idx <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {idx < currentStep ? <Check className="h-4 w-4" /> : idx + 1}
              </div>
              <span className="hidden sm:block ml-2 text-sm font-medium">{step}</span>
              {idx < STEPS.length - 1 && (
                <div
                  className={`w-8 sm:w-12 h-1 mx-2 rounded ${
                    idx < currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 1: Basic Info */}
            {currentStep === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Set up the basics of your quiz</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Banner Upload */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Banner Image
                    </Label>
                    <QuizBannerUpload
                      value={bannerImage}
                      onChange={setBannerImage}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quiz Title *</Label>
                    <Input
                      placeholder="e.g., JavaScript Fundamentals Challenge"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Brief description of your quiz..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Knowledge</SelectItem>
                          <SelectItem value="tech">Technology</SelectItem>
                          <SelectItem value="science">Science</SelectItem>
                          <SelectItem value="entertainment">Entertainment</SelectItem>
                          <SelectItem value="sports">Sports</SelectItem>
                          <SelectItem value="history">History</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Max Participants</Label>
                      <Input
                        type="number"
                        value={maxParticipants}
                        onChange={(e) => setMaxParticipants(e.target.value)}
                        placeholder="100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Custom Code
                      </Label>
                      <Input
                        placeholder="e.g., TECH101"
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                        maxLength={10}
                        className="font-mono uppercase"
                      />
                      <p className="text-xs text-muted-foreground">Optional: Set a memorable code</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Make Public</Label>
                    <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                  </div>

                  {/* Scheduling */}
                  <QuizScheduler
                    scheduledStart={scheduledStart}
                    onScheduleChange={setScheduledStart}
                    registrationOpen={registrationOpen}
                    onRegistrationChange={setRegistrationOpen}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 2: Questions */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Bulk Import Toggle */}
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{questions.length} question{questions.length !== 1 ? "s" : ""} added</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkImport(!showBulkImport)}
                  >
                    {showBulkImport ? "Manual Entry" : "Bulk Import"}
                  </Button>
                </div>

                {/* Bulk Import Section */}
                {showBulkImport ? (
                  <QuizBulkImport
                    onImport={handleBulkImport}
                    existingCount={questions.length}
                  />
                ) : (
                  <>
                {/* Question Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>{editingQuestion ? "Edit Question" : "Add Question"}</CardTitle>
                    <CardDescription>
                      Add questions one by one
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question *</Label>
                      <Textarea
                        placeholder="Enter your question..."
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Options (select correct answer)</Label>
                      <RadioGroup
                        value={String(correctOption)}
                        onValueChange={(v) => setCorrectOption(parseInt(v))}
                      >
                        {options.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <RadioGroupItem value={String(idx)} id={`opt-${idx}`} />
                            <Input
                              placeholder={`Option ${idx + 1}`}
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...options];
                                newOpts[idx] = e.target.value;
                                setOptions(newOpts);
                              }}
                              className="flex-1"
                            />
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Time Limit (seconds)</Label>
                        <Select value={String(timeLimit)} onValueChange={(v) => setTimeLimit(parseInt(v))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 seconds</SelectItem>
                            <SelectItem value="15">15 seconds</SelectItem>
                            <SelectItem value="20">20 seconds</SelectItem>
                            <SelectItem value="30">30 seconds</SelectItem>
                            <SelectItem value="45">45 seconds</SelectItem>
                            <SelectItem value="60">60 seconds</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Points</Label>
                        <Select value={String(points)} onValueChange={(v) => setPoints(parseInt(v))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 points</SelectItem>
                            <SelectItem value="10">10 points</SelectItem>
                            <SelectItem value="15">15 points</SelectItem>
                            <SelectItem value="20">20 points</SelectItem>
                            <SelectItem value="25">25 points</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button onClick={addQuestion} className="w-full gap-2">
                      <Plus className="h-4 w-4" />
                      {editingQuestion ? "Update Question" : "Add Question"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Questions List */}
                {questions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Questions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {questions.map((q, idx) => (
                        <div
                          key={q.id}
                          className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                        >
                          <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-sm">
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{q.question_text}</p>
                            <p className="text-xs text-muted-foreground">
                              {q.time_limit_seconds}s · {q.points} pts
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => editQuestion(q)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteQuestion(q.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
                  </>
                )}
              </div>
            )}

            {/* Step 3: Settings */}
            {currentStep === 2 && (
              <QuizSettingsForm settings={settings} onChange={setSettings} />
            )}

            {/* Step 4: Prizes */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Prizes & Rewards
                  </CardTitle>
                  <CardDescription>Optional: Add prizes for winners</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      🥇 1st Place Prize
                    </Label>
                    <Input
                      placeholder="e.g., ₹500 Amazon Gift Card"
                      value={prizes.first}
                      onChange={(e) => setPrizes((p) => ({ ...p, first: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      🥈 2nd Place Prize
                    </Label>
                    <Input
                      placeholder="e.g., 100 AITD Coins"
                      value={prizes.second}
                      onChange={(e) => setPrizes((p) => ({ ...p, second: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      🥉 3rd Place Prize
                    </Label>
                    <Input
                      placeholder="e.g., 50 AITD Coins"
                      value={prizes.third}
                      onChange={(e) => setPrizes((p) => ({ ...p, third: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((s) => s - 1)}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={() => setCurrentStep((s) => s + 1)}
              disabled={!canProceed()}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={createQuiz}
              disabled={isCreating || !canProceed()}
              className="gap-2 bg-gradient-to-r from-primary to-purple-500"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Create Quiz
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
