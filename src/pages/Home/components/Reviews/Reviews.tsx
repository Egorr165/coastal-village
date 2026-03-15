import Button from '../../../../components/Button/Button';
import { REVIEWS } from '../../../../data/homeData';
import './Reviews.scss';

const Reviews = () => {
  return (
    <section id="reviews" className="reviews">
      <div className="container">
        <div className="reviews__header">
          <h2 className="reviews__title">Отзывы наших гостей</h2>
          <Button variant="secondary" size="lg">Смотреть остальные</Button>
        </div>

        <div className="reviews__grid">
          {REVIEWS.map((review) => (
            <div key={review.id} className="reviews__card">
              <div className="reviews__card-header">
                <img src={review.avatar} alt={review.name} className="reviews__avatar" />
                <div>
                  <p className="reviews__date">{review.date}</p>
                  <h4 className="reviews__name">{review.name}</h4>
                </div>
              </div>
              <p className="reviews__text">{review.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
