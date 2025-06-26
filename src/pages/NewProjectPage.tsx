import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import database from "@/lib/database";
import { useWorkflow, WorkflowState, WorkflowEvent } from "@/lib/workflow";

// Add AI-powered template option
const PROJECT_TEMPLATES = [
	{ id: "blank", name: "Blank Project", description: "Start from scratch with an empty project." },
	{ id: "novel", name: "Novel", description: "A template for long-form fiction writing." },
	{ id: "short-story", name: "Short Story", description: "A template for short stories." },
	{ id: "rpg", name: "RPG Campaign", description: "A template for tabletop RPG world/campaign." },
	{
		id: "ai",
		name: "AI-Powered Template",
		description: "Describe your project and let AI generate a template for you.",
	},
];

// --- Template Library Management ---
// (Load templates from DB for selection)
type UserTemplate = {
  id: number;
  name: string;
  description: string;
  genre: string;
  tone: string;
  structure: string;
  template_json: object;
  createdAt: string;
  updatedAt: string;
};

// Define workflow steps and types
export type ProjectCreationStep =
	| "template"
	| "ai-input"
	| "ai-preview"
	| "editing"
	| "validating"
	| "saving"
	| "success"
	| "error";
interface ProjectCreationData {
	templateId: string;
	name: string;
	description: string;
	aiPrompt: string;
	genre: string;
	tone: string;
	structure: string;
	error?: string;
}
type ProjectCreationEvent =
	| { type: "SELECT_TEMPLATE"; payload: string }
	| { type: "AI_INPUT"; payload: string }
	| { type: "AI_GENERATE" }
	| { type: "AI_RESULT"; payload: { name: string; description: string } }
	| { type: "EDIT"; payload: Partial<ProjectCreationData> }
	| { type: "SUBMIT" }
	| { type: "VALIDATE" }
	| { type: "SAVE" }
	| { type: "SUCCESS" }
	| { type: "FAIL"; payload: string }
	| { type: "CANCEL" };

const initialState: WorkflowState<ProjectCreationData> = {
	step: "template",
	data: {
		templateId: "",
		name: "",
		description: "",
		aiPrompt: "",
		genre: "",
		tone: "",
		structure: "",
		error: undefined,
	},
};

const reducer = (
	state: WorkflowState<ProjectCreationData>,
	event: ProjectCreationEvent
): WorkflowState<ProjectCreationData> => {
	switch (event.type) {
		case "SELECT_TEMPLATE": {
			if (event.payload === "ai") {
				return {
					...state,
					step: "ai-input",
					data: { ...state.data, templateId: "ai", aiPrompt: "", error: undefined },
				};
			}
			if (event.payload.startsWith("user-")) {
				const userId = parseInt(event.payload.replace("user-", ""), 10);
				return {
					...state,
					step: "editing",
					data: { ...state.data, templateId: event.payload, error: undefined },
				};
			}
			const template = PROJECT_TEMPLATES.find((t) => t.id === event.payload);
			return {
				step: "editing",
				data: {
					...state.data,
					templateId: event.payload,
					name: template?.name || "",
					description: template?.description || "",
					aiPrompt: "",
					error: undefined,
				},
			};
		}
		case "AI_INPUT":
			return { ...state, data: { ...state.data, aiPrompt: event.payload, error: undefined } };
		case "AI_GENERATE":
			return {
				...state,
				step: "editing",
				data: {
					...state.data,
					name: "AI Generated Project",
					description: "Let AI fill this in...",
					error: undefined,
				},
			};
		case "AI_RESULT":
			return {
				...state,
				step: "ai-preview",
				data: { ...state.data, ...event.payload, error: undefined },
			};
		case "EDIT":
			return { ...state, data: { ...state.data, ...event.payload, error: undefined } };
		case "SUBMIT":
			return { ...state, step: "validating", data: { ...state.data, error: undefined } };
		case "VALIDATE": {
			if (!state.data.name.trim()) {
				return {
					...state,
					step: "editing",
					data: { ...state.data, error: "Project name is required." },
				};
			}
			return { ...state, step: "saving", data: { ...state.data, error: undefined } };
		}
		case "SAVE":
			return { ...state, step: "saving", data: { ...state.data, error: undefined } };
		case "SUCCESS":
			return { ...state, step: "success", data: { ...state.data, error: undefined } };
		case "FAIL":
			return { ...state, step: "error", data: { ...state.data, error: event.payload } };
		case "CANCEL":
			return {
				...state,
				step: "template",
				data: {
					templateId: "",
					name: "",
					description: "",
					aiPrompt: "",
					genre: "",
					tone: "",
					structure: "",
					error: undefined,
				},
			};
		default:
			return state;
	}
};

// --- Helper to get active AI provider ---
async function getActiveAIProvider() {
  const providers = await database.listAIProviders();
  return providers.find((p) => p.is_active) || null;
}

// --- AI API integration helper with dynamic provider selection and fallback logic ---
async function generateTemplateWithAI(
  prompt: string,
  genre: string,
  tone: string,
  structure: string
): Promise<{ name: string; description: string; genre: string; tone: string; structure: string }> {
  const activeProvider = await getActiveAIProvider();
  if (!activeProvider) {
    throw new Error('No active AI provider configured. Please add and activate a provider in settings.');
  }
  // Use provider settings
  const API_URL = activeProvider.endpoint || 'https://api.openai.com/v1/chat/completions';
  const API_KEY = activeProvider.api_key;
  const model = activeProvider.model || 'gpt-3.5-turbo';
  const systemPrompt = 'You are an assistant that helps users create project templates. Given a user description and metadata, generate a project name, a short description, and echo the genre, tone, and structure.';
  const userPrompt = `Description: ${prompt}\nGenre: ${genre}\nTone: ${tone}\nStructure: ${structure}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY ? { 'Authorization': `Bearer ${API_KEY}` } : {})
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 256
      })
    });
    if (!response.ok) throw new Error('AI API request failed');
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const nameMatch = content.match(/Project Name:\s*(.*)/i);
    const descMatch = content.match(/Description:\s*([\s\S]*?)(?:\n|$)/i);
    const genreMatch = content.match(/Genre:\s*(.*)/i);
    const toneMatch = content.match(/Tone:\s*(.*)/i);
    const structureMatch = content.match(/Structure:\s*(.*)/i);
    return {
      name: nameMatch ? nameMatch[1].trim() : 'AI Project',
      description: descMatch ? descMatch[1].trim() : '',
      genre: genreMatch ? genreMatch[1].trim() : genre,
      tone: toneMatch ? toneMatch[1].trim() : tone,
      structure: structureMatch ? structureMatch[1].trim() : structure
    };
  } catch (primaryError) {
    // Fallback: Try any other non-active provider
    const providers = await database.listAIProviders();
    const fallback = providers.find((p) => !p.is_active);
    if (fallback) {
      try {
        const response = await fetch(fallback.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(fallback.api_key ? { 'Authorization': `Bearer ${fallback.api_key}` } : {})
          },
          body: JSON.stringify({
            model: fallback.model || 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 256
          })
        });
        if (!response.ok) throw new Error('Fallback AI API request failed');
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const nameMatch = content.match(/Project Name:\s*(.*)/i);
        const descMatch = content.match(/Description:\s*([\s\S]*?)(?:\n|$)/i);
        const genreMatch = content.match(/Genre:\s*(.*)/i);
        const toneMatch = content.match(/Tone:\s*(.*)/i);
        const structureMatch = content.match(/Structure:\s*(.*)/i);
        return {
          name: nameMatch ? nameMatch[1].trim() : 'AI Project',
          description: descMatch ? descMatch[1].trim() : '',
          genre: genreMatch ? genreMatch[1].trim() : genre,
          tone: toneMatch ? toneMatch[1].trim() : tone,
          structure: structureMatch ? structureMatch[1].trim() : structure
        };
      } catch (fallbackError) {
        throw new Error('Both AI providers failed. Please try again later.');
      }
    } else {
      throw new Error('AI provider failed and no fallback is configured.');
    }
  }
}

const NewProjectPage = () => {
	const navigate = useNavigate();
	const [workflow, sendWorkflow] = useWorkflow<ProjectCreationData, ProjectCreationEvent>(
		initialState,
		reducer
	);
	const [aiLoading, setAiLoading] = React.useState(false);

	// --- Template Library State ---
	const [userTemplates, setUserTemplates] = useState<UserTemplate[]>([]);
	useEffect(() => {
		database.getProjectTemplates().then(setUserTemplates);
	}, []);

	// Handle form field changes
	const handleChange =
		(field: keyof ProjectCreationData) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			sendWorkflow({ type: "EDIT", payload: { [field]: e.target.value } });
		};

	// Handle AI prompt input
	const handleAIPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		sendWorkflow({ type: "AI_INPUT", payload: e.target.value });
	};

	// Simulate AI generation (replace with real AI call)
	const handleAIGenerate = async () => {
		setAiLoading(true);
		try {
			const result = await generateTemplateWithAI(
				workflow.data.aiPrompt,
				workflow.data.genre,
				workflow.data.tone,
				workflow.data.structure
			);
			sendWorkflow({ type: "AI_RESULT", payload: result });
		} catch (err) {
			sendWorkflow({ type: "FAIL", payload: "AI template generation failed." });
		} finally {
			setAiLoading(false);
		}
	};

	// Handle form submit
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		sendWorkflow({ type: "SUBMIT" });
		sendWorkflow({ type: "VALIDATE" });
		if (!workflow.data.name.trim()) return;
		sendWorkflow({ type: "SAVE" });
		try {
			await database.addProject({
				name: workflow.data.name,
				description: workflow.data.description,
				settings: { templateId: workflow.data.templateId },
			});
			sendWorkflow({ type: "SUCCESS" });
			navigate("/projects");
		} catch (error) {
			console.error('Failed to create project:', error);
			sendWorkflow({ type: "FAIL", payload: "Failed to create project. Please try again." });
		}
	};

	// Handle cancel
	const handleCancel = () => {
		sendWorkflow({ type: "CANCEL" });
		navigate("/projects");
	};

	const isSaving = workflow.step === "saving";

	// --- Template selection step ---
	if (workflow.step === "template") {
		return (
			<div className="max-w-xl mx-auto p-8">
				<h2 className="text-2xl font-bold mb-6">Choose a Project Template</h2>
				<div className="grid gap-4 mb-8">
					{PROJECT_TEMPLATES.map((t) => (
						<div
							key={t.id}
							className={`border rounded p-4 cursor-pointer hover:border-primary ${
								workflow.data.templateId === t.id ? "border-primary bg-primary/10" : ""
							}`}
							onClick={() => sendWorkflow({ type: "SELECT_TEMPLATE", payload: t.id })}
						>
							<div className="font-semibold text-lg">{t.name}</div>
							<div className="text-sm text-muted-foreground">{t.description}</div>
						</div>
					))}
				</div>
				{userTemplates.length > 0 && (
					<>
						<h3 className="text-lg font-semibold mb-2">My Templates</h3>
						<div className="grid gap-4 mb-8">
							{userTemplates.map((t) => (
								<div
									key={t.id}
									className="border rounded p-4 cursor-pointer hover:border-primary"
									onClick={() => sendWorkflow({ type: "SELECT_TEMPLATE", payload: `user-${t.id}` })}
								>
									<div className="font-semibold text-lg">{t.name}</div>
									<div className="text-sm text-muted-foreground">{t.description}</div>
									<div className="text-xs text-muted-foreground">Genre: {t.genre} | Tone: {t.tone} | Structure: {t.structure}</div>
								</div>
							))}
						</div>
					</>
				)}
				<Button variant="outline" onClick={() => navigate("/projects")}>Cancel</Button>
			</div>
		);
	}

	// --- AI-powered template input step ---
	if (workflow.step === "ai-input") {
		return (
			<div className="max-w-xl mx-auto p-8">
				<h2 className="text-2xl font-bold mb-6">Describe Your Project</h2>
				<textarea
					className="w-full border rounded px-3 py-2 mb-4"
					placeholder="Describe what you want to create (e.g. 'A sci-fi novel about AI')"
					rows={4}
					value={workflow.data.aiPrompt}
					onChange={handleAIPromptChange}
					disabled={aiLoading}
				/>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
					<div>
						<label className="block mb-1 font-medium">Genre</label>
						<input
							type="text"
							className="w-full border rounded px-3 py-2"
							placeholder="e.g. Sci-Fi, Fantasy"
							value={workflow.data.genre}
							onChange={handleChange("genre")}
							disabled={aiLoading}
						/>
					</div>
					<div>
						<label className="block mb-1 font-medium">Tone</label>
						<input
							type="text"
							className="w-full border rounded px-3 py-2"
							placeholder="e.g. Serious, Humorous"
							value={workflow.data.tone}
							onChange={handleChange("tone")}
							disabled={aiLoading}
						/>
					</div>
					<div>
						<label className="block mb-1 font-medium">Structure</label>
						<input
							type="text"
							className="w-full border rounded px-3 py-2"
							placeholder="e.g. Three-Act, Episodic"
							value={workflow.data.structure}
							onChange={handleChange("structure")}
							disabled={aiLoading}
						/>
					</div>
				</div>
				<div className="flex gap-2">
					<Button onClick={handleAIGenerate} disabled={aiLoading || !workflow.data.aiPrompt}>
						{aiLoading ? "Generating..." : "Generate Template with AI"}
					</Button>
					<Button variant="outline" onClick={handleCancel} disabled={aiLoading}>
						Cancel
					</Button>
				</div>
			</div>
		);
	}

	// --- AI-powered template preview & customization step ---
	if (workflow.step === "ai-preview") {
		const handleSaveTemplate = async () => {
			await database.addProjectTemplate({
				name: workflow.data.name,
				description: workflow.data.description,
				genre: workflow.data.genre,
				tone: workflow.data.tone,
				structure: workflow.data.structure,
				template_json: {
					name: workflow.data.name,
					description: workflow.data.description,
					genre: workflow.data.genre,
					tone: workflow.data.tone,
					structure: workflow.data.structure,
				},
			});
			// Refresh user templates
			database.getProjectTemplates().then(setUserTemplates);
			alert("Template saved to library!");
		};
		return (
			<div className="max-w-xl mx-auto p-8">
				<h2 className="text-2xl font-bold mb-6">AI-Generated Template Preview</h2>
				<div className="mb-4">
					<label className="block mb-1 font-medium">Project Name</label>
					<input
						type="text"
						className="w-full border rounded px-3 py-2"
						value={workflow.data.name}
						onChange={handleChange("name")}
					/>
				</div>
				<div className="mb-4">
					<label className="block mb-1 font-medium">Description</label>
					<textarea
						className="w-full border rounded px-3 py-2"
						rows={3}
						value={workflow.data.description}
						onChange={handleChange("description")}
					/>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
					<div>
						<label className="block mb-1 font-medium">Genre</label>
						<input
							type="text"
							className="w-full border rounded px-3 py-2"
							value={workflow.data.genre}
							onChange={handleChange("genre")}
						/>
					</div>
					<div>
						<label className="block mb-1 font-medium">Tone</label>
						<input
							type="text"
							className="w-full border rounded px-3 py-2"
							value={workflow.data.tone}
							onChange={handleChange("tone")}
						/>
					</div>
					<div>
						<label className="block mb-1 font-medium">Structure</label>
						<input
							type="text"
							className="w-full border rounded px-3 py-2"
							value={workflow.data.structure}
							onChange={handleChange("structure")}
						/>
					</div>
				</div>
				<div className="flex gap-2 mb-4">
					<Button onClick={() => sendWorkflow({ type: "EDIT", payload: {} })}>
						Edit Details
					</Button>
					<Button onClick={handleAIGenerate}>
						Regenerate with AI
					</Button>
					<Button variant="outline" onClick={handleCancel}>
						Cancel
					</Button>
					<Button variant="secondary" onClick={handleSaveTemplate}>
						Save as Template
					</Button>
				</div>
				<Button onClick={() => sendWorkflow({ type: "EDIT", payload: {} })}>
					Use This Template
				</Button>
			</div>
		);
	}

	// --- Project details step ---
	if (workflow.step === "editing" && workflow.data.templateId.startsWith("user-")) {
		const userId = parseInt(workflow.data.templateId.replace("user-", ""), 10);
		const userTemplate = userTemplates.find((t) => t.id === userId);
		if (userTemplate) {
			// Pre-fill fields from user template
			if (
				workflow.data.name !== userTemplate.name ||
				workflow.data.description !== userTemplate.description
			) {
				setTimeout(() => {
					sendWorkflow({
						type: "EDIT",
						payload: {
							name: userTemplate.name,
							description: userTemplate.description,
							genre: userTemplate.genre,
							tone: userTemplate.tone,
							structure: userTemplate.structure,
						},
					});
				}, 0);
			}
		}
	}

	return (
		<div className="max-w-xl mx-auto p-8">
			<h2 className="text-2xl font-bold mb-6">Create New Project</h2>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block mb-1 font-medium">Project Name</label>
					<input
						type="text"
						className="w-full border rounded px-3 py-2"
						placeholder="Enter project name"
						required
						value={workflow.data.name}
						onChange={handleChange("name")}
						disabled={isSaving}
					/>
				</div>
				<div>
					<label className="block mb-1 font-medium">Description</label>
					<textarea
						className="w-full border rounded px-3 py-2"
						placeholder="Describe your project (optional)"
						rows={3}
						value={workflow.data.description}
						onChange={handleChange("description")}
						disabled={isSaving}
					/>
				</div>
				{workflow.data.error && <div className="text-red-600 text-sm">{workflow.data.error}</div>}
				<div className="flex gap-2">
					<Button type="submit" disabled={isSaving}>
						{isSaving ? "Creating..." : "Create Project"}
					</Button>
					<Button type="button" variant="outline" onClick={handleCancel}>
						Cancel
					</Button>
				</div>
			</form>
		</div>
	);
};

export default NewProjectPage;
