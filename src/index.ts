import {ApplicationConfig} from '@loopback/core';
import {TableReservationApplication} from './application';

export {TableReservationApplication};

export async function main(options: ApplicationConfig = {}) {
  const app = new TableReservationApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);

  return app;
}
