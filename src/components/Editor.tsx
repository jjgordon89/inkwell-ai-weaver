
import React from 'react';

const Editor = () => {
    const initialText = `In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat: it was a hobbit-hole, and that means comfort.`;
    const [text, setText] = React.useState(initialText);
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;


    return (
        <div className="h-full flex flex-col bg-background">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">Chapter 1: An Unexpected Party</h2>
            </div>
            <div className="flex-grow p-8 md:p-12 lg:p-16">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full max-w-3xl mx-auto h-full resize-none bg-transparent focus:outline-none font-serif text-lg leading-relaxed text-foreground"
                    placeholder="Start writing your story..."
                />
            </div>
             <div className="p-4 border-t text-right text-sm text-muted-foreground">
                {wordCount} Words
            </div>
        </div>
    )
}

export default Editor;
