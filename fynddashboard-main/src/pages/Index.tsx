import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, LayoutDashboard, Star, Sparkles, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen gradient-soft">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Feedback System
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Transform Feedback into{" "}
            <span className="text-primary">Actionable Insights</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            A two-dashboard system that collects customer reviews and uses AI to generate 
            summaries, responses, and recommended actions in real-time.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* User Dashboard Card */}
          <Card className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300 animate-slide-up">
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl gradient-warm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-7 h-7 text-accent-foreground" />
              </div>
              <CardTitle className="font-serif text-2xl">User Dashboard</CardTitle>
              <CardDescription className="text-base">
                Public-facing review submission portal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-warning" />
                  Select star rating (1-5)
                </li>
                <li className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  Write a short review
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  Receive AI-generated response
                </li>
              </ul>
              <Link to="/user" className="block">
                <Button className="w-full gradient-warm text-accent-foreground hover:opacity-90 transition-opacity group">
                  Open User Dashboard
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Dashboard Card */}
          <Card className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="w-7 h-7 text-primary-foreground" />
              </div>
              <CardTitle className="font-serif text-2xl">Admin Dashboard</CardTitle>
              <CardDescription className="text-base">
                Internal analytics and AI insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-primary" />
                  Live-updating submission list
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  AI-generated summaries
                </li>
                <li className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-warning" />
                  Recommended actions
                </li>
              </ul>
              <Link to="/admin" className="block">
                <Button className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity group">
                  Open Admin Dashboard
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Tech Stack */}
        <div className="text-center mt-16 text-sm text-muted-foreground">
          <p>Built with React • Lovable Cloud • AI-Powered Analysis</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
