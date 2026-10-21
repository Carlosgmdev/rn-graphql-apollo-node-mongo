import { randomUUID } from "node:crypto";

export class DomainError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "DomainError";
    this.code = code;
  }
}

// Una instancia por servidor. Los tests crean una nueva para aislar sus datos.
// Memoria deliberadamente: al reiniciar el backend vuelves al conjunto inicial.
export function createStore() {
  const users = [
    { id: "u1", name: "Carlos", role: "Mobile developer" },
    { id: "u2", name: "Ana", role: "Backend developer" },
  ];

  const tasks = [
    {
      id: "t1",
      title: "Explorar el schema en Apollo Sandbox",
      status: "TODO",
      assigneeId: "u1",
      createdAt: "2026-10-01T09:00:00.000Z",
    },
    {
      id: "t2",
      title: "Conectar React Native con Apollo Client",
      status: "IN_PROGRESS",
      assigneeId: "u1",
      createdAt: "2026-10-01T10:00:00.000Z",
    },
    {
      id: "t3",
      title: "Levantar Express y Apollo Server",
      status: "DONE",
      assigneeId: "u2",
      createdAt: "2026-10-01T11:00:00.000Z",
    },
  ];

  return {
    listUsers: () => users.map((user) => ({ ...user })),
    findUser: (id) => users.find((user) => user.id === id) ?? null,
    listTasks: () => tasks.map((task) => ({ ...task })),
    findTask: (id) => tasks.find((task) => task.id === id) ?? null,
    createTask({ title, assigneeId = null }) {
      const cleanTitle = title.trim();

      if (!cleanTitle || cleanTitle.length > 120) {
        throw new DomainError(
          "El título debe tener entre 1 y 120 caracteres.",
          "BAD_USER_INPUT",
        );
      }

      if (
        assigneeId !== null &&
        !users.some((user) => user.id === assigneeId)
      ) {
        throw new DomainError("El responsable no existe.", "BAD_USER_INPUT");
      }

      const task = {
        id: randomUUID(),
        title: cleanTitle,
        status: "TODO",
        assigneeId,
        createdAt: new Date().toISOString(),
      };

      tasks.unshift(task);
      return { ...task };
    },

    setTaskStatus(id, status) {
      if (!["TODO", "IN_PROGRESS", "DONE"].includes(status)) {
        throw new DomainError("Estado inválido.", "BAD_USER_INPUT");
      }

      const task = tasks.find((item) => item.id === id);
      if (!task) throw new DomainError("La tarea no existe.", "NOT_FOUND");
      task.status = status;
      return { ...task };
    },
  };
}
