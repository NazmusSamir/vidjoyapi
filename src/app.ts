import express,{Request,Response} from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import * as middlewares from './middlewares';
import api from './api';
import MessageResponse from './interfaces/MessageResponse';
import { vidsrc } from './functions/vidsrc';
import { send } from 'process';

require('dotenv').config();

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get<{}, MessageResponse> ('/:id', async (req:Request, res:Response) => {
  let ss: string | null = req.query.ss ? String(req.query.ss) : null;
  let ep: string | null = req.query.ep ? String(req.query.ep) : null;
  let id = String(req.params.id)
  const data = await vidsrc(id,ss,ep)
  res.json(data)

});

app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
