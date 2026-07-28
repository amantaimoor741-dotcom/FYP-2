import * as functions from 'firebase-functions/v1';
import app from './server/index.ts';

export const api = functions.https.onRequest(app);
