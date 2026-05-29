import 'dotenv/config';
import app from './app.js';
import { initDatabase } from './config/db.js';

const port = Number(process.env.PORT || 5004);

await initDatabase();

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
