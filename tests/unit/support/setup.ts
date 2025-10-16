import dotenv from 'dotenv';


dotenv.config({ path: '.env', quiet: true });
process.env.NODE_ENV = 'test';
