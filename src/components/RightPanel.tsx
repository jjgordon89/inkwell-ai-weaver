
import { Lightbulb, User } from 'lucide-react';
import { Button } from "@/components/ui/button";

const RightPanel = () => {
    return (
        <div className="h-full bg-muted/30 p-4 flex flex-col space-y-6 border-l">
            <div>
                <h3 className="text-lg font-semibold flex items-center mb-2">
                    <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                    AI Suggestions
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                    Select text in the editor to get AI-powered suggestions for improving your writing.
                </p>
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">Improve</Button>
                    <Button variant="outline" size="sm">Shorten</Button>
                    <Button variant="outline" size="sm">Expand</Button>
                    <Button variant="outline" size="sm">Fix Grammar</Button>
                </div>
            </div>

            <div className="flex-grow border-t pt-6">
                <h3 className="text-lg font-semibold flex items-center mb-2">
                    <User className="h-5 w-5 mr-2 text-primary" />
                    Character Info
                </h3>
                <div className="text-sm text-muted-foreground space-y-4">
                    <p>No character selected.</p>
                    <p>Click on a character's name in your text to see their details here.</p>
                </div>
            </div>
        </div>
    );
}

export default RightPanel;
