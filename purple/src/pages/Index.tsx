import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, FileAudio } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [userName, setUserName] = useState(""); // <-- Add this line
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if it's an audio file
      if (file.type.startsWith("audio/")) {
        setAudioFile(file);
        toast({
          title: "Audio file selected",
          description: `Selected: ${file.name}`,
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an audio file",
          variant: "destructive",
        });
      }
    }
  };

  // Update uploadToGoogleDrive to include userName (rename if you wish)
  const uploadToSupabase = async (
    file: File,
    userName: string,
    description: string
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userName", userName);
    formData.append("description", description);

    const response = await fetch("http://localhost:4000/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }
    return await response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName.trim()) {
      toast({
        title: "User name required",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }

    if (!audioFile) {
      toast({
        title: "No file selected",
        description: "Please select an audio file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please provide a description for your audio sample",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadToSupabase(audioFile, userName, description);

      if (result.success) {
        toast({
          title: "Upload successful!",
          description: "Your audio sample has been uploaded.",
        });

        // Reset form
        setUserName("");
        setAudioFile(null);
        setDescription("");

        // Reset file input
        const fileInput = document.getElementById(
          "audio-upload"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description:
          "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Custom AI Voice
          </h1>
          <p className="text-xl text-purple-200 leading-relaxed">
            Please upload a sample audio file that our team can use to ensure
            you get the best AI voice quality.
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm hover:border-purple-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
          <CardHeader className="space-y-4">
            <CardTitle className="text-2xl text-white">
              Upload Your Audio Sample
            </CardTitle>
            <CardDescription className="text-purple-200 text-lg">
              Please provide any more details that would be necessary
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Input */}
              <div className="space-y-3">
                <Label
                  htmlFor="user-name"
                  className="text-white text-lg font-medium"
                >
                  Your Name
                </Label>
                <Input
                  id="user-name"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-slate-700/50 border-purple-500/30 text-white placeholder-purple-300 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300"
                  autoComplete="off"
                />
              </div>

              {/* Audio File Upload */}
              <div className="space-y-3">
                <Label
                  htmlFor="audio-upload"
                  className="text-white text-lg font-medium"
                >
                  Please upload your audio sample
                </Label>
                <div className="relative">
                  <Input
                    id="audio-upload"
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Label
                    htmlFor="audio-upload"
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed border-purple-400/50 rounded-lg cursor-pointer hover:border-purple-400 transition-all duration-300 bg-purple-900/20 hover:bg-purple-900/30 group"
                  >
                    <div className="text-center">
                      {audioFile ? (
                        <div className="flex flex-col items-center space-y-2">
                          <FileAudio className="w-8 h-8 text-purple-400" />
                          <span className="text-purple-200 font-medium">
                            {audioFile.name}
                          </span>
                          <span className="text-sm text-purple-300">
                            Click to change file
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-2">
                          <Upload className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
                          <span className="text-purple-200 font-medium">
                            Click to upload audio file
                          </span>
                          <span className="text-sm text-purple-300">
                            MP3, WAV, M4A supported
                          </span>
                        </div>
                      )}
                    </div>
                  </Label>
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-3">
                <Label
                  htmlFor="description"
                  className="text-white text-lg font-medium"
                >
                  Description & Additional Details
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide any additional details about your audio sample, such as the voice characteristics, recording quality, or specific requirements..."
                  className="min-h-32 bg-slate-700/50 border-purple-500/30 text-white placeholder-purple-300 focus:border-purple-400 focus:ring-purple-400/20 resize-none hover:border-purple-400/50 transition-all duration-300"
                  rows={5}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isUploading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isUploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Uploading...</span> {/* <-- Updated message */}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Upload className="w-5 h-5" />
                    <span>Submit Audio Sample</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-purple-300 text-sm">
            Your audio sample will be securely stored and processed by our AI
            team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
