import express from 'express';
import { json } from 'express';
import patientRoutes from './routes/patientRoutes';
import { auditMiddleware } from './middleware/audit';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

app.use(json());
app.use(auditMiddleware);

// Swagger Documentation
try {
  const swaggerDocument = YAML.load(path.join(process.cwd(), 'specs/001-patient-domain/contracts/openapi.yaml'));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
  console.warn('Swagger documentation could not be loaded:', e);
}

app.use('/v1/patients', patientRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

export default app;
