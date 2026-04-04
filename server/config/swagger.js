import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TriggrPay API Documentation",
      version: "1.0.0",
      description: "API documentation for the TriggrPay Fintech Platform",
      contact: {
        name: "TriggrPay Support",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js", "./index.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
