import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileJson, 
  FileSpreadsheet, 
  Sparkles, 
  AlertCircle, 
  Check,
  Download,
  Loader2
} from "lucide-react";

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
  time_limit_seconds: number;
  points: number;
}

interface QuizBulkImportProps {
  onImport: (questions: Question[]) => void;
  existingCount: number;
}

const CSV_TEMPLATE = `question,option1,option2,option3,option4,correct_option,time_limit,points
"What is the capital of France?","Paris","London","Berlin","Madrid",0,30,10
"Which planet is closest to the Sun?","Mercury","Venus","Earth","Mars",0,20,10`;

const JSON_TEMPLATE = `[
  {
    "question_text": "What is the capital of France?",
    "options": ["Paris", "London", "Berlin", "Madrid"],
    "correct_option_index": 0,
    "time_limit_seconds": 30,
    "points": 10
  }
]`;

export function QuizBulkImport({ onImport, existingCount }: QuizBulkImportProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importTab, setImportTab] = useState<"csv" | "json" | "paste">("csv");
  const [pasteContent, setPasteContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const parseCSV = (content: string): Question[] => {
    const lines = content.trim().split("\n");
    if (lines.length < 2) throw new Error("CSV must have header and at least one question");

    const questions: Question[] = [];
    const parseErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        // Handle quoted values with commas
        const matches = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!matches || matches.length < 6) {
          parseErrors.push(`Row ${i + 1}: Not enough columns`);
          continue;
        }

        const cleanValue = (v: string) => v.replace(/^"|"$/g, "").trim();
        const questionText = cleanValue(matches[0]);
        const options = [
          cleanValue(matches[1]),
          cleanValue(matches[2]),
          cleanValue(matches[3] || ""),
          cleanValue(matches[4] || ""),
        ].filter(Boolean);

        const correctOption = parseInt(cleanValue(matches[5])) || 0;
        const timeLimit = parseInt(cleanValue(matches[6] || "30")) || 30;
        const points = parseInt(cleanValue(matches[7] || "10")) || 10;

        if (options.length < 2) {
          parseErrors.push(`Row ${i + 1}: At least 2 options required`);
          continue;
        }

        questions.push({
          id: crypto.randomUUID(),
          question_text: questionText,
          options,
          correct_option_index: correctOption,
          time_limit_seconds: timeLimit,
          points,
        });
      } catch (err) {
        parseErrors.push(`Row ${i + 1}: Failed to parse`);
      }
    }

    setErrors(parseErrors);
    return questions;
  };

  const parseJSON = (content: string): Question[] => {
    const data = JSON.parse(content);
    const arr = Array.isArray(data) ? data : [data];
    
    return arr.map((item) => ({
      id: crypto.randomUUID(),
      question_text: item.question_text || item.question || "",
      options: item.options || [],
      correct_option_index: item.correct_option_index ?? item.correct ?? 0,
      time_limit_seconds: item.time_limit_seconds ?? item.time_limit ?? 30,
      points: item.points ?? 10,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrors([]);

    try {
      const content = await file.text();
      let questions: Question[] = [];

      if (file.name.endsWith(".csv")) {
        questions = parseCSV(content);
      } else if (file.name.endsWith(".json")) {
        questions = parseJSON(content);
      } else {
        throw new Error("Unsupported file format. Use .csv or .json");
      }

      setPreviewQuestions(questions);
      toast({
        title: "File processed",
        description: `Found ${questions.length} questions`,
      });
    } catch (err: any) {
      toast({
        title: "Import failed",
        description: err.message || "Failed to parse file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasteImport = () => {
    if (!pasteContent.trim()) return;

    setIsProcessing(true);
    setErrors([]);

    try {
      let questions: Question[] = [];
      
      // Try JSON first
      if (pasteContent.trim().startsWith("[") || pasteContent.trim().startsWith("{")) {
        questions = parseJSON(pasteContent);
      } else {
        questions = parseCSV(pasteContent);
      }

      setPreviewQuestions(questions);
      toast({
        title: "Content processed",
        description: `Found ${questions.length} questions`,
      });
    } catch (err: any) {
      toast({
        title: "Import failed",
        description: err.message || "Failed to parse content",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmImport = () => {
    if (previewQuestions.length === 0) return;
    onImport(previewQuestions);
    setPreviewQuestions([]);
    setPasteContent("");
    toast({
      title: "Questions imported! 🎉",
      description: `Added ${previewQuestions.length} questions`,
    });
  };

  const downloadTemplate = (format: "csv" | "json") => {
    const content = format === "csv" ? CSV_TEMPLATE : JSON_TEMPLATE;
    const blob = new Blob([content], { type: format === "csv" ? "text/csv" : "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quiz-template.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Bulk Import Questions
        </CardTitle>
        <CardDescription>
          Import questions from CSV or JSON files
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.json"
          onChange={handleFileUpload}
          className="hidden"
        />

        <Tabs value={importTab} onValueChange={(v) => setImportTab(v as any)}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="csv" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              CSV
            </TabsTrigger>
            <TabsTrigger value="json" className="gap-2">
              <FileJson className="h-4 w-4" />
              JSON
            </TabsTrigger>
            <TabsTrigger value="paste" className="gap-2">
              <Upload className="h-4 w-4" />
              Paste
            </TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV
              </Button>
              <Button variant="outline" onClick={() => downloadTemplate("csv")}>
                <Download className="h-4 w-4 mr-2" />
                Template
              </Button>
            </div>
            <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
              <p className="font-medium mb-1">CSV Format:</p>
              <code className="text-[10px]">
                question,option1,option2,option3,option4,correct_option,time_limit,points
              </code>
            </div>
          </TabsContent>

          <TabsContent value="json" className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload JSON
              </Button>
              <Button variant="outline" onClick={() => downloadTemplate("json")}>
                <Download className="h-4 w-4 mr-2" />
                Template
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="paste" className="space-y-4">
            <Textarea
              placeholder="Paste your CSV or JSON content here..."
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
            <Button
              onClick={handlePasteImport}
              disabled={!pasteContent.trim() || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Process Content
            </Button>
          </TabsContent>
        </Tabs>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium text-sm">{errors.length} warnings</span>
            </div>
            <ul className="text-xs text-destructive/80 space-y-1">
              {errors.slice(0, 3).map((err, i) => (
                <li key={i}>• {err}</li>
              ))}
              {errors.length > 3 && <li>... and {errors.length - 3} more</li>}
            </ul>
          </div>
        )}

        {/* Preview */}
        {previewQuestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="font-medium">{previewQuestions.length} questions ready</span>
              </div>
              <Badge variant="outline">
                Total: {existingCount + previewQuestions.length}
              </Badge>
            </div>
            
            <div className="max-h-40 overflow-y-auto space-y-2">
              {previewQuestions.slice(0, 5).map((q, i) => (
                <div key={q.id} className="text-sm p-2 rounded bg-muted">
                  <span className="font-medium">{i + 1}.</span> {q.question_text.slice(0, 60)}
                  {q.question_text.length > 60 && "..."}
                </div>
              ))}
              {previewQuestions.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{previewQuestions.length - 5} more questions
                </p>
              )}
            </div>

            <Button onClick={confirmImport} className="w-full gap-2 bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4" />
              Import {previewQuestions.length} Questions
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
