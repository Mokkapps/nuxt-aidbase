# Nuxt Aidbase

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Nuxt module to integrate Aidbase features into your app.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)

## Features

- Adds an `AidbaseChatbot` component for embedding the Aidbase chat widget.
- Server API endpoint `/api/aidbase/faq` to fetch mapped FAQ items from Aidbase for a configured knowledge base.
- Automatically configures Vue to treat `ab-` prefixed elements as custom elements.

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxi module add nuxt-aidbase
```

That's it! You can now use Nuxt Aidbase in your Nuxt app ✨

### Module options / configuration

Add configuration to your `nuxt.config` under the `aidbase` key. Example:

```ts
export default defineNuxtConfig({
  aidbase: {
    // ID of the Aidbase FAQ knowledge base to use for `/api/aidbase/faq`
    faqKnowledgeId: 'your-faq-knowledge-id',
  },
})
```

Important environment variables:

- `NUXT_PRIVATE_AIDBASE_API_TOKEN` (required) — Your Aidbase API token. The module will log an error at setup if this is not set and the server endpoints that require it will return an error.
- `NUXT_PRIVATE_AIDBASE_FAQ_CACHE_MAX_AGE` (optional) — Cache TTL (in seconds) for the FAQ endpoint in production. Defaults to `3600`.

Security note: The API token must be stored in a private server-only env var (the module reads it via `process.env.NUXT_PRIVATE_AIDBASE_API_TOKEN` and exposes it to server runtime config only).

## Usage

### Component: `AidbaseChatbot`

The module auto-registers a component named `AidbaseChatbot` that you can place anywhere in your application.

Props:

| Prop    | Type                          | Required | Default                                  | Description |
|---------|-------------------------------|----------|------------------------------------------|-------------|
| `id`    | string                        | yes      | -                                        | The Aidbase chatbot ID (from your Aidbase dashboard). |
| `theme` | `'light'` \| `'dark'`         | no       | `'light'`                                | Chat widget theme. |
| `classes` | string                      | no       | `'fixed p-4 bottom-0 right-0 z-[99]'`    | Additional CSS classes for the widget container. |
| `styles` | CSSStyleValue                | no       | -                                        | Inline styles for the widget container. |

Example:

```vue
<template>
  <AidbaseChatbot id="my-chatbot-id" theme="dark"></AidbaseChatbot>
</template>
```

Notes:
- The component injects the Aidbase client script (`https://client.aidbase.ai/chat.ab.js`) and will add a small helper script to set the chatbot id on SPA navigation.
- The module configures Vue compiler options so elements prefixed with `ab-` are treated as custom elements (no warnings).

### Server API: GET /api/aidbase/faq

This module exposes a server handler at `/api/aidbase/faq` that fetches FAQ items from the Aidbase API for a configured knowledge base and returns a simplified array of items with `question` and `answer` fields.

Behavior:
- Reads the Aidbase API token and FAQ knowledge id from runtime config:
  - `NUXT_PRIVATE_AIDBASE_API_TOKEN` (env var) — **mandatory**
  - `runtimeConfig.public.aidbase.faqKnowledgeId` (module option / nuxt config)
- Fetches from: `https://api.aidbase.ai/v1/knowledge/{faqKnowledgeId}/faq-items`
- Returns an array of `{ question: string, answer: string }` where `answer` is a markdown string assembled from the Aidbase response.
- The handler is cached using Nuxt's `cachedEventHandler`. Default cache age:
  - In dev: 1 second
  - In production: value of `NUXT_PRIVATE_AIDBASE_FAQ_CACHE_MAX_AGE` (seconds) or fallback to `3600` (1 hour)

Example response:

```json
[
  {
    "question": "How do I reset my password?",
    "answer": "You can reset your password by..."
  },
  {
    "question": "Is there a free tier?",
    "answer": "Yes — the free tier includes..."
  }
]
```

Errors:
- If the API token is missing, the endpoint returns HTTP 500 with message: `Aidbase API token is not configured.`
- If the FAQ knowledge id is missing, the endpoint returns HTTP 500 with message: `Aidbase FAQ knowledge ID is not configured.`

## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  npm install
  
  # Generate type stubs
  npm run dev:prepare
  
  # Develop with the playground
  npm run dev
  
  # Build the playground
  npm run dev:build
  
  # Run ESLint
  npm run lint
  
  # Run Vitest
  npm run test
  npm run test:watch
  
  # Release new version
  npm run release
  ```

</details>


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-aidbase/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-aidbase

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-aidbase.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/nuxt-aidbase

[license-src]: https://img.shields.io/npm/l/nuxt-aidbase.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-aidbase

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
