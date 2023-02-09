import { extendTheme, ThemeConfig } from '@chakra-ui/react'
import { mode, GlobalStyleProps } from '@chakra-ui/theme-tools'
import '@fontsource/quicksand/600.css'

type Breakpoints = {
  [breakpoint: string]: string
}

type Fonts = {
  body: string;
}

const breakpoints: Breakpoints = {
  '1100px': '1100px',
  '741px': '741px',
  '601px': '601px',
  '600px': '600px',
  '447px': '447px',
  '446px': '446px'
}

const styles = {
  global: (props: GlobalStyleProps) => ({
    body: {
      bg: mode('#d1d1d1', '#141822')(props)
    }
  })
}

const fonts: Fonts = {
  body: `'Quicksand', sans-serif`
}

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: true,
}

export default extendTheme({ fonts, config, styles, breakpoints })
