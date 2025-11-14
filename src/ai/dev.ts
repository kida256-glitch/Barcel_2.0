import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-seller-reviews.ts';
import '@/ai/flows/flag-inappropriate-comments.ts';