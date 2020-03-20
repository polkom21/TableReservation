import {TableReservationApplication} from './application';
import {ApplicationConfig} from '@loopback/core';

export {TableReservationApplication};

export async function main(options: ApplicationConfig = {}) {
  const app = new TableReservationApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}
