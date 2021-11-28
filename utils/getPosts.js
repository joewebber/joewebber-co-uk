import { createClient } from 'contentful'

const SPACE = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID
const TOKEN = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN

const client = createClient({
  space: SPACE,
  accessToken: TOKEN
})

const getPosts = async () =>  {
  const entries = await client.getEntries({ content_type: 'post' })
  if (entries.items) {
    return entries.items
  }
  console.log(`Error getting Entries for ${contentType.name}.`)
}

export default getPosts