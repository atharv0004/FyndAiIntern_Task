import { useEffect, useState } from "react";
import { StarRating } from "@/components/StarRating";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, 
  Star, 
  MessageSquare, 
  TrendingUp, 
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Review {
  id: string;
  star_rating: number;
  review_text: string;
  ai_response: string | null;
  ai_summary: string | null;
  ai_recommended_actions: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
      } else {
        setReviews(data || []);
      }
      setIsLoading(false);
    };

    fetchReviews();

    // Set up real-time subscription
    const channel = supabase
      .channel("reviews-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reviews",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setReviews((prev) => [payload.new as Review, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setReviews((prev) =>
              prev.map((r) => (r.id === payload.new.id ? (payload.new as Review) : r))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Calculate analytics
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.star_rating, 0) / totalReviews).toFixed(1)
    : "0.0";
  const positiveReviews = reviews.filter((r) => r.star_rating >= 4).length;
  const negativeReviews = reviews.filter((r) => r.star_rating <= 2).length;

  const getSentimentColor = (rating: number) => {
    if (rating >= 4) return "bg-success/10 text-success border-success/20";
    if (rating <= 2) return "bg-destructive/10 text-destructive border-destructive/20";
    return "bg-warning/10 text-warning border-warning/20";
  };

  const getSentimentLabel = (rating: number) => {
    if (rating >= 4) return "Positive";
    if (rating <= 2) return "Negative";
    return "Neutral";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            <h1 className="font-serif text-xl font-semibold text-foreground">Admin Dashboard</h1>
          </div>
          <Link to="/">
            <Button variant="ghost" size="sm">
              ← User Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                  <p className="text-3xl font-serif font-bold text-foreground">{totalReviews}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <p className="text-3xl font-serif font-bold text-foreground">{averageRating}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <Star className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Positive</p>
                  <p className="text-3xl font-serif font-bold text-success">{positiveReviews}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Needs Attention</p>
                  <p className="text-3xl font-serif font-bold text-destructive">{negativeReviews}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-serif text-2xl flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Live Submissions
            </CardTitle>
            <CardDescription>
              Real-time view of all customer feedback with AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No reviews yet. Submissions will appear here in real-time.
              </div>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card 
                      key={review.id} 
                      className="border-border/50 hover:border-primary/30 transition-colors"
                    >
                      <CardContent className="pt-6">
                        {/* Header */}
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <StarRating rating={review.star_rating} readonly size="sm" />
                            <Badge 
                              variant="outline" 
                              className={getSentimentColor(review.star_rating)}
                            >
                              {getSentimentLabel(review.star_rating)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {format(new Date(review.created_at), "MMM d, yyyy h:mm a")}
                          </div>
                        </div>

                        {/* Review Text */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            Customer Review
                          </h4>
                          <p className="text-foreground">{review.review_text}</p>
                        </div>

                        {/* AI Analysis */}
                        {review.ai_summary && (
                          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border">
                            {/* AI Summary */}
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <Sparkles className="w-4 h-4 text-primary" />
                                AI Summary
                              </h4>
                              <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">
                                {review.ai_summary}
                              </p>
                            </div>

                            {/* Recommended Actions */}
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <TrendingUp className="w-4 h-4 text-accent" />
                                Recommended Actions
                              </h4>
                              <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">
                                {review.ai_recommended_actions}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Processing indicator */}
                        {!review.ai_summary && (
                          <div className="pt-4 border-t border-border">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Sparkles className="w-4 h-4 animate-pulse-soft text-primary" />
                              Processing with AI...
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
