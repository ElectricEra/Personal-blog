import { AppProps } from 'next/app';
import { Inter, Roboto, Merriweather } from '@next/font/google';
import './global.css';

// TODO: Other fonts to experiments
const inter = Inter({ subsets: ['latin', 'cyrillic'] });
const roboto = Roboto({
  weight: '400',
  subsets: ['latin', 'cyrillic'],
});
// END OF TODO
const merriweather = Merriweather({
  weight: '400',
  subsets: ['latin', 'cyrillic'],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <main className={`${merriweather.className}`}>
        <Component {...pageProps} />
      </main>
    </>
  )
}
