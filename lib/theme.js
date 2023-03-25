import { extendTheme } from '@chakra-ui/react'
import '@fontsource/quicksand/600.css'

const breakpoints = {
  '1100px': '1100px',
  '426px': '426px'
}

const styles = {
  global: () => ({
    body: {
      bg: '#141822'
    }
  })
}

const fonts = {
  body: `'Quicksand', sans-serif`
}

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false
}

export default extendTheme({ fonts, config, styles, breakpoints })
