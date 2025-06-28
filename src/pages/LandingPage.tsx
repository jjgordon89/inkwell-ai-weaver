
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PenTool, Book, Users, Lightbulb } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Your Creative Writing Studio
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Organize your stories, develop characters, build worlds, and write with AI assistance - all in one place.
          </p>
          <Link to="/studio">
            <Button size="lg" className="text-lg px-8 py-3">
              Start Writing
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="text-center p-6">
            <PenTool className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Writing Tools</h3>
            <p className="text-slate-600">Rich editor with AI assistance for better writing</p>
          </div>
          
          <div className="text-center p-6">
            <Book className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Story Structure</h3>
            <p className="text-slate-600">Organize chapters, scenes, and story arcs</p>
          </div>
          
          <div className="text-center p-6">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Character Development</h3>
            <p className="text-slate-600">Create and track character relationships</p>
          </div>
          
          <div className="text-center p-6">
            <Lightbulb className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">World Building</h3>
            <p className="text-slate-600">Build rich, detailed fictional worlds</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
