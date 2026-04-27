import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { FAQS } from '../../../../data/homeData';
import './Faq.scss';

const Faq = () => {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="faq-section">
      <div className="faq-container faq">
        <h2 className="faq__title">Частые вопросы</h2>

        <div className="faq__list">
          {FAQS.map((faq) => (
            <div key={faq.id} className="faq__item">
              <button type="button" onClick={() => toggleFaq(faq.id)} className="faq__question-btn">
                <span className={`faq__question-text ${openId === faq.id ? 'active' : ''}`}>
                  {faq.question}
                </span>
                <span className="faq__icon">
                  {openId === faq.id ? <Minus size={18} /> : <Plus size={18} />}
                </span>
              </button>

              <div className={`faq__answer ${openId === faq.id ? 'open' : ''}`}>
                <p className="faq__answer-text">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;
