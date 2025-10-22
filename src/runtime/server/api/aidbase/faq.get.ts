import { useRuntimeConfig, cachedEventHandler } from 'nitropack/runtime'
import type { H3Event } from 'h3'
import { createError } from 'h3'

const LOGGER_PREFIX = '[aidbase/faq.get]:'

interface FaqItemAnswerTextChild {
  text: string
}

interface FaqItemAnswerLinkChild {
  children: Array<FaqItemAnswerTextChild>
  data: {
    url: string
  }
}

interface FaqItemChild {
  children: Array<FaqItemAnswerLinkChild | FaqItemAnswerTextChild>
  type: 'bulleted-list' | 'paragraph'
}

interface FaqItem {
  answer: Array<FaqItemChild>
  question: string
}

interface FaqItemsResponse {
  data: {
    items: Array<FaqItem>
  }
  success: boolean
}

export default cachedEventHandler(async (event) => {
  const {
    _nuxtAidbaseConfig: { apiToken, faqKnowledgeId },
  } = useRuntimeConfig(event)

  if (!apiToken) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Aidbase API token is not configured.',
    })
  }

  if (!faqKnowledgeId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Aidbase FAQ knowledge ID is not configured.',
    })
  }

  try {
    const faqItems = await $fetch<FaqItemsResponse>(
      `https://api.aidbase.ai/v1/knowledge/${faqKnowledgeId}/faq-items`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      },
    )

    // return an object with an "answer" as markdown string and "question" as string
    const mappedFaqItems = faqItems.data.items.map(item => ({
      answer: item.answer
        .map((child) => {
          if (child.type === 'bulleted-list') {
            return child.children
              .map((child) => {
                if ('children' in child) {
                  return child.children
                    .map(child => `- ${child.text}`)
                    .join('')
                }
                return ''
              })
              .join('  \n')
          }
          else {
            return child.children
              .map((child) => {
                if ('text' in child) {
                  return child.text
                }
                else if ('data' in child && 'url' in child.data) {
                  return `[${child.children[0]?.text ?? ''}](${
                    child.data.url
                  })`
                }
                return ''
              })
              .join('')
          }
        })
        .join('  \n'),
      question: item.question,
    }))

    return mappedFaqItems
  }
  catch (error: any) {
    console.error(`${LOGGER_PREFIX} Failed to get Aidbase FAQ items`, error)
    throw createError({
      ...error,
      statusCode: error.status || error.statusCode || 500,
      statusMessage: error.statusMessage || error.message,
    })
  }
}, {
  getKey: (event: H3Event) => event.path,
  maxAge: import.meta.dev ? 1 : process.env.NUXT_PRIVATE_AIDBASE_FAQ_CACHE_MAX_AGE ? Number(process.env.NUXT_PRIVATE_AIDBASE_FAQ_CACHE_MAX_AGE) : 60 * 60, // default 1 hour
})
