# Local AI Models Integration Guide

## Overview
Inkwell AI Weaver now supports local AI models through **Ollama** and **LM Studio**, allowing you to run AI models privately without sending data to external services.

## Supported Local Providers

### 🦙 Ollama
- **Purpose**: Run open-source LLMs locally
- **Default endpoint**: `http://localhost:11434`
- **Installation**: Download from [ollama.ai](https://ollama.ai)
- **Model management**: Use `ollama pull <model-name>` command

### 🎯 LM Studio
- **Purpose**: User-friendly interface for local LLMs
- **Default endpoint**: `http://localhost:1234`
- **Installation**: Download from [lmstudio.ai](https://lmstudio.ai)
- **Model management**: Download and manage models through the GUI

## Features Implemented

### ✅ Core Integration
- **API Request Handling**: Custom API request functions for both Ollama and LM Studio
- **Connection Testing**: Automatic connection detection and testing
- **Model Discovery**: Dynamic model loading from local providers
- **Status Monitoring**: Real-time connection status with periodic checks

### ✅ User Interface Components
- **LocalProviderStatus**: Real-time status indicator with setup instructions
- **LocalModelManager**: Model discovery and management interface
- **LocalModelTester**: Interactive testing tool for local models
- **Enhanced AI Settings**: Comprehensive configuration modal and quick settings

### ✅ Provider Configuration
- **Dynamic Model Lists**: Models are automatically discovered and updated
- **Connection Status**: Visual indicators for provider availability
- **Setup Instructions**: Built-in guidance for installation and configuration
- **Error Handling**: Graceful fallbacks when providers are unavailable

## How It Works

### Text Processing Flow
1. **Provider Selection**: User selects Ollama or LM Studio as provider
2. **Connection Check**: System verifies the provider is running and accessible
3. **Model Discovery**: Available models are fetched and displayed
4. **Text Processing**: When processing text, the system:
   - Uses the appropriate API format (Ollama `/api/generate` or LM Studio OpenAI-compatible)
   - Sends requests to the local endpoint
   - Falls back to mock processing if the provider is unavailable

### API Implementations

#### Ollama API
```typescript
// POST to http://localhost:11434/api/generate
{
  "model": "selected-model",
  "prompt": "user-prompt",
  "stream": false,
  "options": {
    "temperature": 0.7,
    "num_predict": 1000
  }
}
```

#### LM Studio API (OpenAI-compatible)
```typescript
// POST to http://localhost:1234/v1/chat/completions
{
  "model": "selected-model",
  "messages": [
    {"role": "system", "content": "system-prompt"},
    {"role": "user", "content": "user-prompt"}
  ],
  "max_tokens": 1000,
  "temperature": 0.7
}
```

### Model Discovery
- **Ollama**: Fetches from `/api/tags` endpoint
- **LM Studio**: Fetches from `/v1/models` endpoint
- **Auto-refresh**: Models are updated every 30 seconds
- **Provider Integration**: Discovered models are added to the AI provider constants

## Usage Instructions

### Setting Up Ollama
1. Download and install Ollama from [ollama.ai](https://ollama.ai)
2. Open terminal and run: `ollama pull llama2` (or another model)
3. Ensure Ollama is running (it starts automatically on most systems)
4. In Inkwell AI Weaver, select "Ollama" as your provider
5. Available models will be automatically detected

### Setting Up LM Studio
1. Download and install LM Studio from [lmstudio.ai](https://lmstudio.ai)
2. Download a model through the LM Studio interface
3. Start the local server in LM Studio (usually localhost:1234)
4. In Inkwell AI Weaver, select "LM Studio" as your provider
5. Available models will be automatically detected

### Testing Your Setup
1. Navigate to the AI Assistance section
2. Select your local provider (Ollama or LM Studio)
3. Choose an available model
4. Use the "Local Model Testing" section to verify everything works
5. Try processing text in the story editor

## Model Recommendations

### For Writing Tasks
- **Llama 3.1 8B**: Good balance of speed and quality for most writing tasks
- **Mistral 7B**: Excellent for creative writing and storytelling
- **CodeLlama**: Specialized for technical writing and documentation

### Performance Considerations
- **8B models**: Require ~8GB RAM, good for most tasks
- **70B models**: Require ~40GB RAM, excellent quality but slower
- **Local processing**: Slower than cloud APIs but completely private

## Troubleshooting

### Common Issues
1. **Provider not detected**: Ensure the service is running and accessible
2. **No models available**: Download/install models through the provider's interface
3. **Slow responses**: Local models are typically slower than cloud APIs
4. **Memory issues**: Larger models require more RAM

### Debug Features
- **Connection testing**: Use the test connection button in provider settings
- **Status indicators**: Visual feedback shows provider connectivity
- **Model tester**: Interactive testing tool for verification
- **Console logging**: Detailed logs in browser developer tools

## Files Modified/Created

### Core Integration
- `src/hooks/ai/textProcessing.ts`: Added Ollama and LM Studio API handlers
- `src/hooks/ai/connectionTest.ts`: Added connection testing for local providers
- `src/hooks/ai/constants.ts`: Updated provider configurations
- `src/hooks/ai/useAIOperations.ts`: Updated to handle providers without API keys

### Utility Functions
- `src/utils/localModels.ts`: Local model discovery and management utilities
- `src/hooks/ai/useLocalModels.ts`: Hook for local model state management

### UI Components
- `src/components/ai/LocalProviderStatus.tsx`: Real-time status indicator
- `src/components/ai/LocalModelManager.tsx`: Model management interface
- `src/components/ai/LocalModelTester.tsx`: Interactive testing tool
- `src/components/sections/ai-assistance/AIProviderSettings.tsx`: Enhanced with local support

## Privacy Benefits
- **No data transmission**: All processing happens locally
- **No API keys required**: No need for external service accounts
- **Complete control**: You own and control the AI models
- **Offline capability**: Works without internet connection (after setup)

## Future Enhancements
- Custom endpoint configuration in UI
- Model performance benchmarking
- Advanced model parameters (temperature, top-p, etc.)
- Model switching shortcuts
- Batch processing capabilities
