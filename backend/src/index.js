import { createApp } from './server.js';

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? '0.0.0.0';
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT inválido');
const { httpServer, apollo } = await createApp();
await new Promise((resolve, reject) => {
  httpServer.once('error', reject);
  httpServer.listen(port, host, resolve);
});
console.log(`GraphQL y Apollo Sandbox: http://localhost:${port}/graphql`);
console.log('Datos en memoria: reiniciar restaura las tareas iniciales.');
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    await apollo.stop();
    process.exit(0);
  });
}
