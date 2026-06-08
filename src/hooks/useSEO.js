/**
 * 🔍 USE SEO — Hook para gerenciar SEO em páginas
 */
import { useEffect } from 'react'
import { setSEOTags, setSchema } from '../utils/seo'

export function useSEO(config = {}) {
  useEffect(() => {
    const {
      title = 'ScoutFut',
      description = 'Siga seu time com dados profissionais',
      image = 'https://brasileirao-site.vercel.app/og-image.png',
      url = 'https://brasileirao-site.vercel.app',
      type = 'website',
      schema = null,
    } = config

    // Atualizar meta tags
    setSEOTags({
      title,
      description,
      image,
      url,
      type,
    })

    // Adicionar schema se fornecido
    if (schema) {
      setSchema(schema)
    }

    // Scroll para o topo
    window.scrollTo(0, 0)
  }, [config])
}
