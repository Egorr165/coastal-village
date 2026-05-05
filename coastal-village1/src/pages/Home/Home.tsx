import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import ContactForm from '../../components/ContactForm/ContactForm';
import Hero from './components/Hero/Hero';
import CottagesList from './components/CottagesList/CottagesList';
import Reviews from './components/Reviews/Reviews';
import Faq from './components/Faq/Faq';
import About from './components/About/About';
import { Helmet } from 'react-helmet-async';

const Home = () => {

  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": "7 Континент — База отдыха в Дагестане",
    "image": "https://7continent-dagestan.ru/logo.svg", 
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Дагестан",
      "addressRegion": "Республика Дагестан",
      "addressCountry": "RU"
    },
    "url": "https://7continent-dagestan.ru/",
    "telephone": "+7 (938) 160-72-31", 
    "priceRange": "RUB"
  };


  return (
    <div className="app">
      <Helmet>
        <title>База отдыха в Дагестане на берегу моря | Аренда коттеджей 7 Континент</title>
        <meta
          name="description"
          content="7 Континент — комфортабельная база отдыха на берегу Каспийского моря в Дагестане. Снимите уютный коттедж для идеального отдыха. Бронируйте онлайн!"
        />
        <script type="application/ld+json">
          {JSON.stringify(homeSchema)}
        </script>
      </Helmet>

      <Header />

      <main>
        <Hero />
        <About />
        <CottagesList />
        <Reviews />
        <Faq />
        <ContactForm />
      </main>

      <Footer />
    </div>
  );
};

export default Home;