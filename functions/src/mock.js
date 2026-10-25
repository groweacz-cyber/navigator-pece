// Falešný klient Anthropic pro emulátor. Nikdy se nepoužije na ostrém projektu
// (index.js ho pustí jen s FUNCTIONS_EMULATOR a KLASIFIKACE_MOCK).

export const mockKlient = {
  messages: {
    async create({ messages }) {
      const t = String(messages[0].content).toLowerCase()
      const potreby = []
      if (t.includes('myt') || t.includes('koup')) potreby.push({ kategorie: 'hygiena', uroven: 's_pomoci' })
      if (t.includes('ztrat') || t.includes('zabloud')) potreby.push({ kategorie: 'orientace', uroven: 'nezvlada' })
      if (t.includes('snědl') || t.includes('jedl')) potreby.push({ kategorie: 'stravovani', uroven: 'zvlada' })
      return { content: [{ type: 'text', text: JSON.stringify({ potreby }) }] }
    },
  },
}
