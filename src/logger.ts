import pino from 'pino';

// Kirjoitetaan stderr:iin — ei häiritse stdio-transportia
export const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' }, process.stderr);
