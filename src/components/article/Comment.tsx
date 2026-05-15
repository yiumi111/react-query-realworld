import { useCreateCommentMutation, useDeleteCommentMutation } from '@/queries/articles.query';
import { useGetUserQuery } from '@/queries/user.query';
import useInputs from '@/lib/hooks/useInputs';
import queryClient from '@/queries/queryClient';
import { QUERY_COMMENTS_KEY } from '@/constants/query.constant';
import convertToDate from '@/lib/utils/convertToDate';
import { IComment } from '@/interfaces/main';

interface ICommentProps {
  comments: IComment[];
  slug: string;
}

const Comment = ({ comments, slug }: ICommentProps) => {
  const { data } = useGetUserQuery();
  const [newComment, onChangeNewComment, setNewComment] = useInputs({ body: '' });
  const createCommentMutation = useCreateCommentMutation();
  const deleteCommentMutation = useDeleteCommentMutation();

  const onPostComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { body } = newComment;
    createCommentMutation.mutate(
      { body, slug },
      {
        onSuccess: (_) => {
          setNewComment({ body: '', slug });
          queryClient.invalidateQueries({ queryKey: [QUERY_COMMENTS_KEY] });
        },
      },
    );
  };

  const onDelete = (slug: string, id: number) => {
    deleteCommentMutation.mutate(
      { slug, id },
      {
        onSuccess: (_) => {
          queryClient.invalidateQueries({ queryKey: [QUERY_COMMENTS_KEY] });
        },
      },
    );
  };

  return (
    <>
      <form className="card comment-form" onSubmit={onPostComment} data-testid="comment-form">
        <div className="card-block">
          <textarea
            className="form-control"
            placeholder="Write a comment..."
            rows={3}
            name="body"
            value={newComment.body}
            onChange={onChangeNewComment}
            data-testid="comment-input"
          ></textarea>
        </div>
        <div className="card-footer">
          <img src={data.image} className="comment-author-img" alt="comment-author" />
          <button type="submit" className="btn btn-sm btn-primary" data-testid="post-comment-btn">
            Post Comment
          </button>
        </div>
      </form>

      {comments.map((comment, index) => (
        <div className="card" key={index} data-testid={`comment-${comment.id}`}>
          <div className="card-block">
            <p className="card-text">{comment.body}</p>
          </div>
          <div className="card-footer">
            <a href="/" className="comment-author">
              <img src={comment.author.image} className="comment-author-img" alt="comment-author" />
            </a>
            &nbsp;
            <a href="/" className="comment-author">
              {comment.author.username}
            </a>
            <span className="date-posted">{convertToDate(comment.updatedAt)}</span>
            {data.username === comment.author.username ? (
              <span className="mod-options" data-testid="mod-options">
                {/* <i className="ion-edit"></i> */}
                <i
                  role="presentation"
                  className="ion-trash-a"
                  onClick={() => onDelete(slug, comment.id)}
                  data-testid={`delete-comment-btn-${comment.id}`}
                ></i>
              </span>
            ) : (
              <></>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

export default Comment;
