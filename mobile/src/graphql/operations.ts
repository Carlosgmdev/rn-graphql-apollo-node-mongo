import { gql, type TypedDocumentNode } from '@apollo/client';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type User = { __typename: 'User'; id: string; name: string; role: string };
export type Task = {
  __typename: 'Task';
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
  assignee: User | null;
};
export type BoardData = { tasks: Task[]; users: User[] };
export type CreateTaskVariables = { input: { title: string; assigneeId?: string | null } };

// Tipos manuales para seguir el contrato durante el curso. Codegen será una práctica posterior.
export const TASK_FIELDS = gql`
  fragment TaskFields on Task {
    id
    title
    status
    createdAt
    assignee { id name role }
  }
`;

export const GET_BOARD: TypedDocumentNode<BoardData, Record<string, never>> = gql`
  query GetBoard {
    tasks { ...TaskFields }
    users { id name role }
  }
  ${TASK_FIELDS}
`;

export const CREATE_TASK: TypedDocumentNode<{ createTask: Task }, CreateTaskVariables> = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) { ...TaskFields }
  }
  ${TASK_FIELDS}
`;

export const SET_TASK_STATUS: TypedDocumentNode<
  { setTaskStatus: Pick<Task, '__typename' | 'id' | 'status'> },
  { id: string; status: TaskStatus }
> = gql`
  mutation SetTaskStatus($id: ID!, $status: TaskStatus!) {
    setTaskStatus(id: $id, status: $status) { id status }
  }
`;
