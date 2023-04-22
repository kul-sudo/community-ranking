import '../styles/globals.css'
import { ChakraProvider } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import theme from '../lib/theme'

const Hydrated = ({ children }) => {
  const [hydration, setHydration] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHydration(true)
    }
  }, [])

  return hydration ? children : null
}

export default function App({ Component, pageProps }) {
  return (
    <Hydrated>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Hydrated>
  )
}
