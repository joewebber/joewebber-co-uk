import { createClient } from 'contentful'

const SPACE = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID
const TOKEN = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN

const client = createClient({
  space: SPACE,
  accessToken: TOKEN
})

const getPost = async (slug) =>  {
  const entries = await client.getEntries({ content_type: 'post', slug })
  if (entries.items) {
    return entries.items[0]
  }
  console.log(`Error getting Entries for ${contentType.name}.`)
}

export default getPost