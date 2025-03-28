const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Appointment booking',
    description: 'API documentation for appointment platform'
  },
  host: 'localhost:3000',
  schemes: ['http'],
  // tags: [
  //   { name: 'Admin', description: 'APIs related to admin operations' },
  //   { name: 'User', description: 'APIs related to user operations' },
  //   { name: 'Common', description: 'Common APIs accessible to all' },
  // ],
};

const outputFile = './swagger.json';
const routes = ['./index.js'];

swaggerAutogen(outputFile, routes, doc);
 