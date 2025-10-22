import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  aidbase: {
    faqKnowledgeId: 'test-faq-knowledge-id',
  },
})
