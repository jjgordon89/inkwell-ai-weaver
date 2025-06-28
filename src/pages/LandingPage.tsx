
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Zap, Brain, Users } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Inkwell AI Weaver
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            An intelligent creative writing assistant powered by AI. Craft compelling stories with advanced AI tools and intuitive writing features.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/projects">
              <Button size="lg" className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Start Writing
              </Button>
            </Link>
            <Link to="/studio">
              <Button variant="outline" size="lg" className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Writing Studio
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI-Powered Writing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get intelligent suggestions, continue writing with AI, and enhance your creativity with advanced language models.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Story Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Organize characters, plot arcs, world-building elements, and manage complex narratives with ease.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Collaborative Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Work with multiple perspectives, track character development, and maintain story consistency.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
