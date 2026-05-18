import useInputs from '@/lib/hooks/useInputs';

interface ICommentFormProps {
  currentUserImage: string;
  onSubmit: (body: string, resetForm: () => void) => void;
  isSubmitting: boolean;
}

const CommentForm = ({ currentUserImage, onSubmit, isSubmitting }: ICommentFormProps) => {
  const [newComment, onChangeNewComment, setNewComment] = useInputs({ body: '' });

  const onPostComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = newComment.body.trim();
    if (!body || isSubmitting) return;

    onSubmit(body, () => setNewComment({ body: '' }));
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
        <img src={currentUserImage} className="comment-author-img" alt="comment-author" />
        <button type="submit" className="btn btn-sm btn-primary" disabled={isSubmitting || !newComment.body.trim()}>
          Post Comment
        </button>
      </div>
    </form>
  );
};

export default CommentForm;