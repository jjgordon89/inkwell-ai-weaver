// Type-safe generic workflow (state machine) utility
// Usage: const [workflow, sendWorkflow] = useWorkflow<ProjectCreationState, ProjectCreationEvent>(...)
import { useReducer, useCallback } from 'react';

export type WorkflowStep = string;

export interface WorkflowState<TData = unknown> {
  step: WorkflowStep;
  data: TData;
  error?: string;
}

export interface WorkflowEvent<TPayload = unknown> {
  type: string;
  payload?: TPayload;
}

export type WorkflowReducer<TData, TEvent extends WorkflowEvent> = (
  state: WorkflowState<TData>,
  event: TEvent
) => WorkflowState<TData>;

export function useWorkflow<TData, TEvent extends WorkflowEvent>(
  initialState: WorkflowState<TData>,
  reducer: WorkflowReducer<TData, TEvent>
): [WorkflowState<TData>, (event: TEvent) => void] {
  const [state, dispatch] = useReducer(reducer, initialState);
  const send = useCallback((event: TEvent) => dispatch(event), []);
  return [state, send];
}

// Example: Define ProjectCreationState and ProjectCreationEvent in your component/module
// type ProjectCreationStep = 'idle' | 'editing' | 'validating' | 'saving' | 'success' | 'error';
// interface ProjectCreationData { name: string; description: string; error?: string; }
// type ProjectCreationEvent = { type: 'EDIT'; payload: Partial<ProjectCreationData> } | ...
