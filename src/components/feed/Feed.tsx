import { Link } from 'react-router-dom';
import { useArticleFavorite } from '@/lib/hooks/useArticleFavorite';
import convertToDate from '@/lib/utils/convertToDate';
import { IArticle } from '@/interfaces/main';

interface IFeedProps {
  article: IArticle;
}

const Feed = ({ article }: IFeedProps) => {
  const { toggleFavorite, isFavoriteLoading } = useArticleFavorite();

  return (
    <div role="presentation" className="article-preview">
      <div className="article-meta">
        <Link to={`/profile/${article.author.username}`} state={article.author.username}>
          <img src={article.author.image} alt="profile" />
        </Link>
        <div className="info">
          <Link to={`/profile/${article.author.username}`} state={article.author.username} className="author">
            {article.author.username}
          </Link>
          <span className="date">{convertToDate(article.createdAt)}</span>
        </div>
        <button
          type="button"
          className={`btn ${article.favorited ? 'btn-primary' : 'btn-outline-primary'} btn-sm pull-xs-right`}
          onClick={() => toggleFavorite(article.slug, article.favorited)}
          disabled={isFavoriteLoading}
        >
          <i className="ion-heart"></i> {article.favoritesCount}
        </button>
      </div>
      <Link to={`/article/${article.slug}`} state={article.slug} className="preview-link">
        <h1>{article.title}</h1>
        <p>{article.description}</p>
        <span>Read more...</span>
      </Link>
    </div>
  );
};

export default Feed;
