import { Link } from 'react-router-dom'

const ratingClass = {
  L: 'rating--l',
  10: 'rating--10',
  12: 'rating--12',
  14: 'rating--14',
  16: 'rating--16',
  18: 'rating--18',
}

export default function MovieCard({ movie, index, canEdit = false, onEdit }) {
  function handleEditClick(e) {
    e.preventDefault()
    e.stopPropagation()
    onEdit?.(movie)
  }

  return (
    <div className="movie-card-wrap">
      {canEdit ? (
        <button
          type="button"
          className="movie-card__edit"
          onClick={handleEditClick}
          aria-label={`Editar ${movie.title}`}
          title="Editar evento"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              fill="currentColor"
              d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l8.06-8.06.92.92L5.92 19.58zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
            />
          </svg>
        </button>
      ) : null}

      <Link
        to={`/filmes/${movie.id}`}
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
      </Link>
    </div>
  )
}
