const ratingClass = {
  L: 'rating--l',
  10: 'rating--10',
  12: 'rating--12',
  14: 'rating--14',
  16: 'rating--16',
  18: 'rating--18',
}

export default function MovieCard({ movie, index }) {
  return (
    <article
      className="movie-card"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="movie-card__poster">
        <img src={movie.image} alt={`Poster de ${movie.title}`} loading="lazy" />
        {movie.rating ? (
          <span className={`movie-card__rating ${ratingClass[movie.rating] || ''}`}>
            {movie.rating}
          </span>
        ) : null}
      </div>

      <div className="movie-card__body">
        <h3 className="movie-card__title">{movie.title}</h3>
      </div>
    </article>
  )
}
