import swaggerJsdoc from 'swagger-jsdoc';

export const getApiDocs = async () => {
    const options = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Next.js Clean Starter API',
                version: '1.0.0',
                description: 'API documentation for the Next.js Clean Architecture Starter Kit',
            },
            components: {
                securitySchemes: {
                    BearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                    ApiKeyAuth: {
                        type: 'apiKey',
                        in: 'header',
                        name: 'Authorization',
                        description: 'API Key prefixed with "sk_"',
                    },
                },
            },
            security: [
                {
                    BearerAuth: [],
                },
                {
                    ApiKeyAuth: [],
                },
            ],
        },
        apis: ['./src/app/api/**/*.ts'], // Path to the API docs
    };

    const spec = swaggerJsdoc(options);
    return spec;
};
