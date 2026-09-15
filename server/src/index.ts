import 'dotenv/config';
import { processReminders, ProcessResult } from './reminders';

processReminders()
  .then((result: ProcessResult) => {
    console.log(
      `Lembretes verificados: ${result.checked}, enviados: ${result.sent}, falharam: ${result.failed}`
    );
    process.exit(0);
  })
  .catch((err: unknown) => {
    console.error('Erro ao processar lembretes:', err);
    process.exit(1);
  });
