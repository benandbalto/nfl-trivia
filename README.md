NFL Trivia is a small web app for kids (and adults) that asks themed NFL multiple-choice trivia questions and scores you.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to start a trivia round.

## Set up Claude (required)

This app generates questions on demand using the Anthropic API. The API key must be set as a server-side environment variable.

1. Create a file named `.env.local` in the project root.
2. Add:

```bash
ANTHROPIC_API_KEY="your_api_key_here"
# Optional: override the Claude model used by the generator
CLAUDE_MODEL="claude-3-5-sonnet-latest"
```

Restart the dev server after updating `.env.local`.

## Deploy on Vercel

After you deploy, question generation happens server-side in `/api/generate-quiz`.

In your Vercel project settings:
1. Add environment variables:
   - `ANTHROPIC_API_KEY`
   - (optional) `CLAUDE_MODEL`
2. Deploy the app.
