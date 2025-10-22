import {
  defineNuxtModule,
  addServerHandler,
  createResolver,
  logger,
  addComponent,
} from '@nuxt/kit'
import { defu } from 'defu'

export interface ModuleOptions {
  /**
   * ID of the Aidbase FAQ knowledge base to use.
   */
  faqKnowledgeId?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-aidbase',
    configKey: 'aidbase',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    if (!process.env.NUXT_PRIVATE_AIDBASE_API_TOKEN) {
      logger.error(
        '[nuxt-aidbase]: NUXT_PRIVATE_AIDBASE_API_TOKEN is missing in environment variables.',
      )
    }

    _nuxt.options.runtimeConfig.public.aidbase = defu(
      _nuxt.options.runtimeConfig.public.aidbase as ModuleOptions,
      _options,
    )

    // add config to runtime, only usable in server
    const runtimeConfig = _nuxt.options.runtimeConfig
    runtimeConfig._nuxtAidbaseConfig = {
      apiToken: process.env.NUXT_PRIVATE_AIDBASE_API_TOKEN,
      faqKnowledgeId: (
        _nuxt.options.runtimeConfig.public.aidbase as ModuleOptions
      ).faqKnowledgeId,
    }

    // Add custom elements for Aidbase components
    const isCustomElement = _nuxt.options.vue.compilerOptions.isCustomElement
    _nuxt.options.vue.compilerOptions.isCustomElement = (tag: string) =>
      tag.startsWith('ab-') || isCustomElement?.(tag) || false

    addComponent({
      name: 'AidbaseChatbot',
      filePath: resolver.resolve('runtime/components/AidbaseChatbot.vue'),
    })

    addServerHandler({
      route: '/api/aidbase/faq',
      handler: resolver.resolve('./runtime/server/api/aidbase/faq.get'),
    })
  },
})
