import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes/routeChanges.js';
import cors from 'cors';
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api', routes);
export default app;
