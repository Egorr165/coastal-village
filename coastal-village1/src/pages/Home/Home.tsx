import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import ContactForm from '../../components/ContactForm/ContactForm';
import Hero from './components/Hero/Hero';
import CottagesList from './components/CottagesList/CottagesList';
import Reviews from './components/Reviews/Reviews';
import Faq from './components/Faq/Faq';
import About from './components/About/About';



const Home = () => {

  return (
    <div className="app">
      
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
