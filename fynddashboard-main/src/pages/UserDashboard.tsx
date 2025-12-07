import { useState } from "react";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function UserDashboard() {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        description: "Choose between 1 to 5 stars before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!review.trim()) {
      toast({
        title: "Please write a review",
        description: "Share your thoughts before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setAiResponse(null);

    try {
      // Insert review into database
      const { data: insertedReview, error: insertError } = await supabase
        .from("reviews")
        .insert({
          star_rating: rating,
          review_text: review,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Call edge function to process with AI
      const { data: aiData, error: aiError } = await supabase.functions.invoke(
        "process-review",
        {
          body: {
            reviewId: insertedReview.id,
            starRating: rating,
            reviewText: review,
          },
        }
      );

      if (aiError) throw aiError;

      setAiResponse(aiData.aiResponse);
      setRating(0);
      setReview("");

      toast({
        title: "Thank you for your feedback!",
        description: "Your review has been submitted successfully.",
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error submitting review",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-soft">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary" />
            <h1 className="font-serif text-xl font-semibold text-foreground">FeedbackHub</h1>
          </div>
          <Link to="/admin">
            <Button variant="ghost" size="sm">
              Admin Dashboard →
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
            Share Your Experience
          </h2>
          <p className="text-muted-foreground text-lg">
            Your feedback helps us improve. Tell us what you think!
          </p>
        </div>

        <Card className="shadow-lg border-border/50 animate-slide-up">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Leave a Review</CardTitle>
            <CardDescription>
              Rate your experience and share your thoughts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Star Rating */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Your Rating
                </label>
                <div className="flex items-center gap-4">
                  <StarRating rating={rating} onRatingChange={setRating} size="lg" />
                  {rating > 0 && (
                    <span className="text-sm text-muted-foreground animate-fade-in">
                      {rating === 1 && "Poor"}
                      {rating === 2 && "Fair"}
                      {rating === 3 && "Good"}
                      {rating === 4 && "Very Good"}
                      {rating === 5 && "Excellent"}
                    </span>
                  )}
                </div>
              </div>

              {/* Review Text */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Your Review
                </label>
                <Textarea
                  placeholder="Tell us about your experience..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-pulse-soft" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Submit Review
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* AI Response */}
        {aiResponse && (
          <Card className="mt-6 border-primary/20 bg-primary/5 animate-scale-in">
            <CardHeader className="pb-2">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Thank You!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{aiResponse}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
