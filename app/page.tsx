// app/page.tsx
'use client'
import { Link } from '@chakra-ui/next-js'
import { Box } from '@chakra-ui/react'

export default function Page() {
  return (
    <Box bg='green' w='120px' h='150px'>
      <Link href='/'>Editor</Link>
      <h1>Page</h1>
    </Box>
  )
}