import { useCreateCommentMutation, useDeleteCommentMutation } from '@/queries/articles.query';
import { useGetUserQuery } from '@/queries/user.query';
import CommentForm from './CommentForm';
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
  const createCommentMutation = useCreateCommentMutation();
  const deleteCommentMutation = useDeleteCommentMutation();

  const onPostComment = (body: string) => {
    createCommentMutation.mutate(
      { body, slug },
      {
        onSuccess: (_) => {
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
      <CommentForm onSubmit={onPostComment} isSubmitting={createCommentMutation.isLoading} />

      {comments.map((comment, index) => (
        <div className="card" key={index}>
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
              <span className="mod-options">
                {/* <i className="ion-edit"></i> */}
                <i role="presentation" className="ion-trash-a" onClick={() => onDelete(slug, comment.id)}></i>
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
