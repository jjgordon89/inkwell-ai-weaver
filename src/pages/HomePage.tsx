
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Globe, Pen } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">AI Writing Assistant</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Create amazing stories with the power of artificial intelligence
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/studio">
              <Button size="lg">
                <Pen className="w-5 h-5 mr-2" />
                Start Writing
              </Button>
            </Link>
            <Link to="/projects">
              <Button variant="outline" size="lg">
                View Projects
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Smart Writing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get AI-powered suggestions and continuations for your story
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Character Development
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Create and manage complex characters with detailed profiles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                World Building
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Build rich, immersive worlds for your stories
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
