import { useState } from "react";
import { Loader2, Send, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AIToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "ask" | "notes" | "quiz";
  title: string;
  subtitle: string;
  placeholder: string;
  subject?: string;
  universityName?: string;
}

const AIToolDialog = ({
  open,
  onOpenChange,
  type,
  title,
  subtitle,
  placeholder,
  subject,
  universityName,
}: AIToolDialogProps) => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!input.trim()) {
      toast({
        title: "Please enter a question or topic",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResponse("");

    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: {
          type,
          message: input,
          subject: subject || "General",
          context: universityName || "University curriculum",
        },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResponse(data.content);
    } catch (error) {
      console.error("AI request error:", error);
      toast({
        title: "Failed to get AI response",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setInput("");
    setResponse("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1">
          <div className="space-y-2">
            <Textarea
              placeholder={placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>

          {response && (
            <div className="flex-1 min-h-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Response</span>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <ScrollArea className="h-[300px] rounded-md border bg-muted/30 p-4">
                <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                  {response}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIToolDialog;
