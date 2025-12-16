# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Enabling Anthropic / Claude Sonnet 4.5

The app can be configured to use Anthropic's Claude (Sonnet 4.5) for text generation.
Set one of the following environment variables to enable it for all clients:

- `AI_PROVIDER=anthropic` (preferred)
- or `USE_CLAUDE=true`

And provide your Anthropic API key in `ANTHROPIC_API_KEY`.

When enabled, the server will use the `claude-sonnet-4.5` model. If Anthropic is not enabled
the app continues to use Google GenAI (requires `GOOGLE_GENAI_API_KEY`).
