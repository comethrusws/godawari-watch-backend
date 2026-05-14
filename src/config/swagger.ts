import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Godawari Alert API',
      version: '1.0.0',
      description: 'API documentation for the Godawari Alert citizen problem escalation system.',
    },
    servers: [
      {
        url: 'https://api-godawari-watch.vercel.app',
        description: 'Production server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../routes/*.js'),
  ], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
