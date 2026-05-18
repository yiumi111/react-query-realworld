import { useState } from 'react';

interface CommentFormProps {
  onSubmit: (body: string) => void;
  isSubmitting: boolean;
}

const CommentForm = ({ onSubmit, isSubmitting }: CommentFormProps) => {
  const [body, setBody] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!body.trim()) return;
    onSubmit(body);
    setBody('');
  };

  return (
    <form className="card comment-form" onSubmit={handleSubmit}>
      <div className="card-block">
        <textarea
          className="form-control"
          placeholder="Write a comment..."
          rows={3}
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        ></textarea>
      </div>
      <div className="card-footer">
        <button type="submit" className="btn btn-sm btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;