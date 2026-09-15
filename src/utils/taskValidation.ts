import { Task } from '../types';

// Single source of truth for task business-rule validation. TaskContext is the only
// write path to Firestore in this app (there is no separate REST API), so running this
// check there acts as the "backend" validation layer - it can never be skipped by any
// screen, matching the requirement that these rules must not rely on the frontend alone.
export function validateTaskPayload(task: Pick<Task, 'taskType' | 'status' | 'congregational' | 'professional' | 'lastDeferral'>): string | null {
  if (task.status === 'deferred' && !task.lastDeferral) {
    return 'Para adiar uma tarefa é obrigatório informar a nova data prevista.';
  }

  if (task.taskType === 'congregational') {
    if (!task.congregational?.activityType) {
      return 'Selecione o tipo de atividade congregacional.';
    }
    if (task.congregational.activityType === 'visit' && !task.congregational.visitedPerson?.trim()) {
      return 'Informe o nome da pessoa que será visitada.';
    }
  }

  if (task.taskType === 'professional') {
    if (!task.professional?.requestDate) {
      return 'Informe a data da solicitação.';
    }
    if (!task.professional?.workTypeId) {
      return 'Selecione o tipo de trabalho.';
    }
  }

  return null;
}
