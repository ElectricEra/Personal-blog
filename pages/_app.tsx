import { AppProps } from 'next/app';
import { Merriweather } from 'next/font/google';
import './global.css';

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
