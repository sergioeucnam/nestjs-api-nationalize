<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

## Description

Aplicativo que consume una API externa [nationalize.io](https://nationalize.io/) y devuelve la probabilidad de la nacionalidad de un nombre dado.

### Arquitectura

La aplicación está desarrollada en NestJS, un framework de NodeJS. Se utilizó un enfoque basado en controladores y servicios, con un controlador que recibe el nombre a consultar y un servicio que se encarga de realizar la petición a la API externa.
En NestJS esto se conoce como arquitectura basada en módulos, donde cada módulo tiene su propio controlador, servicio y módulo.
Por ejemplo las validaciones de los nombres se encuentran en el módulo `name-validation`, el controlador en `name-validation.controller.ts` y el servicio en `name-validation.service.ts`. Por lo tanto, si se desea agregar una nueva funcionalidad, se puede crear un nuevo módulo y agregarlo al módulo principal `app.module.ts` para poder ser utilizado donde se necesite.

Porque una arquitecura basada en módulos?

- Escalabilidad: Permite escalar la aplicación de forma sencilla, ya que cada módulo es independiente y se puede agregar o quitar sin afectar el resto de la aplicación.
- Reutilización: Los módulos pueden ser reutilizados en otras aplicaciones, ya que son independientes.
- Mantenibilidad: Facilita el mantenimiento de la aplicación, ya que cada módulo es independiente y se puede modificar sin afectar el resto de la aplicación.

## Requisitos para correr la aplicación de manera local

```text
- NodeJS 20+
- npm
```

## Requisitos para correr la aplicación en un contenedor

```text
- Docker
- Docker Compose plugin
```

## Instalar localmente

```bash
$ pnpm install  # Instalar las dependencias con pnpm
$ npm install   # Instalar las dependencias con npm
```

## Correr la aplicación

```bash
# development
$ pnpm run start
$ npm run start

# watch mode
$ pnpm run start:dev
$ npm run start:dev

# production mode
$ docker compose up -d --build
```

## Testing

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

```
