import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Sparkles,
  Trophy,
  Calendar,
  Star,
  Crown,
  Zap,
  Gift,
  Plus,
  X,
  Shuffle,
} from "lucide-react";
import confetti from "canvas-confetti";

interface Student {
  name: string;
  email?: string;
  id: string;
}

export default function RandomPicker() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [studentInput, setStudentInput] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [numWinners, setNumWinners] = useState(3);
  const [winners, setWinners] = useState<Student[]>([]);
  const [picking, setPicking] = useState(false);
  const [currentPick, setCurrentPick] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");

  const addStudents = () => {
    const lines = studentInput.trim().split("\n").filter(line => line.trim());
    const newStudents = lines.map((line, index) => ({
      name: line.trim(),
      email: undefined,
      id: `student-${Date.now()}-${index}`,
    }));
    
    setStudents(prev => [...prev, ...newStudents]);
    setStudentInput("");
    
    toast({
      title: `Added ${newStudents.length} students`,
      description: `Total: ${students.length + newStudents.length} students`,
    });
  };

  const removeStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const clearAll = () => {
    setStudents([]);
    setWinners([]);
    setStudentInput("");
  };

  const pickWinners = async () => {
    if (students.length < numWinners) {
      toast({
        title: "Not enough students",
        description: `You need at least ${numWinners} students`,
        variant: "destructive",
      });
      return;
    }

    setPicking(true);
    setWinners([]);

    // Shuffle animation
    const shuffleCount = 20;
    const shuffleDelay = 100;
    
    for (let i = 0; i < shuffleCount; i++) {
      const randomStudent = students[Math.floor(Math.random() * students.length)];
      setCurrentPick(randomStudent.name);
      await new Promise(resolve => setTimeout(resolve, shuffleDelay));
    }

    // Pick actual winners
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const selectedWinners = shuffled.slice(0, numWinners);

    // Reveal winners one by one
    for (let i = 0; i < selectedWinners.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWinners(prev => [...prev, selectedWinners[i]]);
      
      // Confetti for each winner
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#ffffff'],
      });

      toast({
        title: `Winner #${i + 1} Selected!`,
        description: selectedWinners[i].name,
      });
    }

    setPicking(false);
    setCurrentPick("");

    // Final celebration
    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
      });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="container mx-auto max-w-6xl py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top duration-700">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-4">
            <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
            <span className="text-white font-bold">Random Winner Picker</span>
            <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 drop-shadow-2xl">
            PICK LUCKY WINNERS!
          </h1>
          <p className="text-xl text-white/80">Fair and transparent random selection</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6 animate-in fade-in slide-in-from-left duration-700">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white/80 text-sm mb-2 block">Event Title</label>
                  <Input
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="e.g., Hackathon Winner Selection"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
                <div>
                  <label className="text-white/80 text-sm mb-2 block">Event Date</label>
                  <Input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-white/80 text-sm mb-2 block">Number of Winners</label>
                  <Input
                    type="number"
                    value={numWinners}
                    onChange={(e) => setNumWinners(parseInt(e.target.value) || 1)}
                    min="1"
                    max="10"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Add Participants
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={studentInput}
                  onChange={(e) => setStudentInput(e.target.value)}
                  placeholder="Enter student names (one per line)&#10;John Doe&#10;Jane Smith&#10;Bob Johnson"
                  rows={6}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={addStudents}
                    disabled={!studentInput.trim()}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Students
                  </Button>
                  <Button
                    onClick={clearAll}
                    variant="outline"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Student List */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 max-h-96 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Participants
                  </span>
                  <Badge className="bg-white/20 text-white">
                    {students.length} total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto max-h-64">
                {students.length === 0 ? (
                  <p className="text-white/60 text-center py-8">No students added yet</p>
                ) : (
                  <div className="space-y-2">
                    {students.map((student, index) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors animate-in fade-in slide-in-from-bottom duration-300"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <span className="text-white font-medium">{student.name}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeStudent(student.id)}
                          className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-700">
            {/* Picking Animation */}
            {picking && (
              <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-md border-yellow-400/50 animate-pulse">
                <CardContent className="p-12 text-center">
                  <Shuffle className="h-16 w-16 mx-auto text-yellow-400 mb-4 animate-spin" />
                  <div className="text-3xl font-bold text-white mb-2 animate-bounce">
                    {currentPick || "Selecting..."}
                  </div>
                  <p className="text-white/60">Picking winners randomly...</p>
                </CardContent>
              </Card>
            )}

            {/* Winners Display */}
            {winners.length > 0 && (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    Winners Selected!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {eventTitle && (
                    <div className="text-center mb-4">
                      <h3 className="text-2xl font-bold text-white mb-1">{eventTitle}</h3>
                      {eventDate && (
                        <p className="text-white/60 flex items-center justify-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(eventDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {winners.map((winner, index) => (
                    <Card
                      key={winner.id}
                      className={`animate-in fade-in zoom-in duration-500 ${
                        index === 0
                          ? "bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-yellow-400/50"
                          : index === 1
                          ? "bg-gradient-to-br from-gray-300/30 to-gray-400/30 border-gray-400/50"
                          : index === 2
                          ? "bg-gradient-to-br from-orange-600/30 to-orange-700/30 border-orange-400/50"
                          : "bg-white/10 border-white/20"
                      }`}
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {index === 0 ? (
                            <Crown className="h-12 w-12 text-yellow-400 animate-bounce" />
                          ) : index === 1 ? (
                            <Star className="h-10 w-10 text-gray-300" />
                          ) : index === 2 ? (
                            <Trophy className="h-10 w-10 text-orange-400" />
                          ) : (
                            <Gift className="h-8 w-8 text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              className={`${
                                index === 0
                                  ? "bg-yellow-500"
                                  : index === 1
                                  ? "bg-gray-400"
                                  : index === 2
                                  ? "bg-orange-600"
                                  : "bg-blue-500"
                              } text-white`}
                            >
                              #{index + 1}
                            </Badge>
                            <span className="text-white/60 text-sm">
                              {index === 0 ? "1st Place" : index === 1 ? "2nd Place" : index === 2 ? "3rd Place" : `${index + 1}th Place`}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-white">{winner.name}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Action Button */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <Button
                  onClick={pickWinners}
                  disabled={students.length < numWinners || picking}
                  size="lg"
                  className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white font-bold text-xl py-6 rounded-full shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  {picking ? (
                    <span className="flex items-center gap-2">
                      <Zap className="h-6 w-6 animate-pulse" />
                      Picking...
                    </span>
                  ) : winners.length > 0 ? (
                    <span className="flex items-center gap-2">
                      <Shuffle className="h-6 w-6" />
                      Pick Again
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-6 w-6" />
                      Pick {numWinners} Winner{numWinners > 1 ? "s" : ""}
                      <Sparkles className="h-6 w-6" />
                    </span>
                  )}
                </Button>

                {winners.length > 0 && (
                  <div className="mt-4 text-center">
                    <p className="text-white/60 text-sm mb-2">Share the results</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/30"
                        onClick={() => {
                          const text = `Winners of ${eventTitle || "Event"}:\n${winners.map((w, i) => `${i + 1}. ${w.name}`).join("\n")}`;
                          navigator.clipboard.writeText(text);
                          toast({ title: "Copied to clipboard!" });
                        }}
                      >
                        Copy Results
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/30"
                        onClick={() => window.print()}
                      >
                        Print
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info */}
            <Card className="bg-blue-500/20 backdrop-blur-md border-blue-400/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium mb-1">Fair & Random</p>
                    <p className="text-white/70 text-xs">
                      Uses cryptographically secure random selection. Each participant has an equal chance of winning.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => navigate("/games")}
            className="bg-white/10 hover:bg-white/20 text-white border-white/30"
          >
            ← Back to Games
          </Button>
        </div>
      </div>
    </div>
  );
}
