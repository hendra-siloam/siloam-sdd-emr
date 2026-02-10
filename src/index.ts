import express from 'express';
import patientRoutes from './routes/patientRoutes';
import { auditMiddleware } from './middleware/audit';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { config } from './config/env';

const app = express();
const port = config.port;

app.use(express.json());
app.use(auditMiddleware);

// Swagger Documentation
try {
  const swaggerDocument = YAML.load(path.join(process.cwd(), 'specs/001-patient-domain/contracts/openapi.yaml'));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.warn('Swagger documentation could not be loaded:', errorMessage);
}

app.use('/v1/patients', patientRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Only start server if this module is the entry point
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

export default app;
