import useInputs from '@/lib/hooks/useInputs';

interface ICommentFormProps {
  userImage: string;
  onSubmit: (body: string) => void;
  isSubmitting: boolean;
}

const CommentForm = ({ userImage, onSubmit, isSubmitting }: ICommentFormProps) => {
  const [newComment, onChangeNewComment, setNewComment] = useInputs({ body: '' });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { body } = newComment;
    if (!body.trim()) return;
    onSubmit(body);
    setNewComment({ body: '' });
  };

  return (
    <form className="card comment-form" onSubmit={handleSubmit}>
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
        <img src={userImage} className="comment-author-img" alt="comment-author" />
        <button type="submit" className="btn btn-sm btn-primary" disabled={isSubmitting || !newComment.body.trim()}>
          Post Comment
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
