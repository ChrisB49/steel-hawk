// app/page.tsx
'use client'
import { Link } from '@chakra-ui/next-js'
import { Box } from '@chakra-ui/react'

if (!new class { x: any }().hasOwnProperty('x')) throw new Error('Transpiler is not configured correctly');

export default function Page() {
  return (
    <Box bg='green' w='120px' h='150px'>
      <Link href='/editor'>Editor</Link>
      <h1>Page</h1>
    </Box>
  )
}