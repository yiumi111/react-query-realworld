import useInputs from '@/lib/hooks/useInputs';

interface ICommentFormProps {
  authorImage: string;
  isSubmitting: boolean;
  onSubmit: (body: string, reset: () => void) => void;
}

const CommentForm = ({ authorImage, isSubmitting, onSubmit }: ICommentFormProps) => {
  const [newComment, onChangeNewComment, setNewComment] = useInputs({ body: '' });
  const trimmedBody = newComment.body.trim();

  const onPostComment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trimmedBody || isSubmitting) {
      return;
    }

    onSubmit(trimmedBody, () => setNewComment({ body: '' }));
  };

  return (
    <form className="card comment-form" onSubmit={onPostComment}>
      <div className="card-block">
        <textarea
          className="form-control"
          placeholder="Write a comment..."
          rows={3}
          name="body"
          value={newComment.body}
          onChange={onChangeNewComment}
          disabled={isSubmitting}
        ></textarea>
      </div>
      <div className="card-footer">
        <img src={authorImage} className="comment-author-img" alt="comment-author" />
        <button type="submit" className="btn btn-sm btn-primary" disabled={!trimmedBody || isSubmitting}>
          Post Comment
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
