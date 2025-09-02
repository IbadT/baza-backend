// import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

// const configService = new ConfigService();

Sentry.init({
  // dsn: configService.getOrThrow<string>("SENTRY_DSN"),
  dsn: 'https://7f92264b9cb7d331b1797060f79a5453@o4504702503682048.ingest.us.sentry.io/4509927721205760',
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0,
  profileSessionSampleRate: 1.0,

  // sendDefaultPii: true,
  // environment: configService.get<string>("NODE_ENV") || 'development',
  // debug: configService.get<string>("NODE_ENV") === 'development',
  // beforeSend(event, hint) {
});
