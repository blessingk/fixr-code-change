import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes/routeChanges';

const app = express();

app.use(bodyParser.json());
app.use('/api', routes);

export default app;


// import express from 'express';
//
// const app = express();
//
// app.use(express.json());
//
// export default app;