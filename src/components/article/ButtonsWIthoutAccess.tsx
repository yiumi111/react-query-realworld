import { useArticleFavorite } from '@/lib/hooks/useArticleFavorite';
import { useProfileFollow } from '@/lib/hooks/useProfileFollow';
import { IArticle } from '@/interfaces/main';

interface IButtonsWIthoutAccessProps {
  articleInfo: IArticle;
}

const ButtonsWIthoutAccess = ({ articleInfo }: IButtonsWIthoutAccessProps) => {
  const { toggleFavorite, isFavoriteLoading } = useArticleFavorite();
  const { toggleFollow, isFollowLoading } = useProfileFollow();

  return (
    <>
      <button
        type="button"
        className={`btn btn-sm btn-outline-${articleInfo.author.following ? 'primary' : 'secondary'}`}
        onClick={() => toggleFollow(articleInfo.author.username, articleInfo.author.following)}
        disabled={isFollowLoading}
      >
        <i className="ion-plus-round"></i>
        &nbsp; Follow {articleInfo.author.username} <span className="counter">(10)</span>
      </button>
      &nbsp;&nbsp;
      <button
        type="button"
        className={`btn btn-sm btn-outline-${articleInfo.favorited ? 'primary' : 'secondary'}`}
        onClick={() => toggleFavorite(articleInfo.slug, articleInfo.favorited)}
        disabled={isFavoriteLoading}
      >
        <i className="ion-heart"></i>
        &nbsp; Favorite Post <span className="counter">{articleInfo.favoritesCount}</span>
      </button>
    </>
  );
};

export default ButtonsWIthoutAccess;
