import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Comment from '../src/components/article/Comment';
import { useCreateCommentMutation, useDeleteCommentMutation } from '@/queries/articles.query';
import { useGetUserQuery } from '@/queries/user.query';
import queryClient from '@/queries/queryClient';
import { IComment } from '@/interfaces/main';

jest.mock('@/queries/articles.query', () => ({
  useCreateCommentMutation: jest.fn(),
  useDeleteCommentMutation: jest.fn(),
}));

jest.mock('@/queries/user.query', () => ({
  useGetUserQuery: jest.fn(),
}));

jest.mock('@/queries/queryClient', () => ({
  __esModule: true,
  default: {
    invalidateQueries: jest.fn(),
  },
}));

const mockUseCreateCommentMutation = useCreateCommentMutation as jest.Mock;
const mockUseDeleteCommentMutation = useDeleteCommentMutation as jest.Mock;
const mockUseGetUserQuery = useGetUserQuery as jest.Mock;

function createMockMutate() {
  return jest.fn((_variables: unknown, options?: { onSuccess?: (data: unknown) => void }) => {
    options?.onSuccess?.({});
  });
}

const currentUser = {
  username: 'testuser',
  image: 'https://example.com/avatar.jpg',
  bio: 'test bio',
};

const otherUser = {
  username: 'otheruser',
  image: 'https://example.com/other.jpg',
  bio: 'other bio',
};

function buildComment(overrides: Partial<IComment> = {}): IComment {
  return {
    id: 1,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    body: 'Great article!',
    author: {
      username: 'testuser',
      bio: 'test bio',
      image: 'https://example.com/avatar.jpg',
      following: false,
    },
    ...overrides,
  };
}

const slug = 'test-article-slug';

describe('Comment', () => {
  let mockCreateMutate: jest.Mock;
  let mockDeleteMutate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCreateMutate = createMockMutate();
    mockDeleteMutate = createMockMutate();

    mockUseCreateCommentMutation.mockReturnValue({ mutate: mockCreateMutate });
    mockUseDeleteCommentMutation.mockReturnValue({ mutate: mockDeleteMutate });
    mockUseGetUserQuery.mockReturnValue({ data: currentUser });
  });

  describe('comment submission', () => {
    it('calls useCreateCommentMutation().mutate with { body, slug } when form is submitted', async () => {
      render(<Comment comments={[]} slug={slug} />);

      const textarea = screen.getByPlaceholderText('Write a comment...');
      const submitButton = screen.getByRole('button', { name: 'Post Comment' });

      await userEvent.type(textarea, 'Nice post!');
      await userEvent.click(submitButton);

      expect(mockCreateMutate).toHaveBeenCalledTimes(1);
      expect(mockCreateMutate).toHaveBeenCalledWith(
        { body: 'Nice post!', slug },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });

    it('clears the input after successful submission', async () => {
      render(<Comment comments={[]} slug={slug} />);

      const textarea = screen.getByPlaceholderText('Write a comment...') as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: 'Post Comment' });

      await userEvent.type(textarea, 'Nice post!');
      expect(textarea.value).toBe('Nice post!');

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(textarea.value).toBe('');
      });
    });

    it('triggers comment cache invalidation after successful submission', async () => {
      render(<Comment comments={[]} slug={slug} />);

      const textarea = screen.getByPlaceholderText('Write a comment...');
      const submitButton = screen.getByRole('button', { name: 'Post Comment' });

      await userEvent.type(textarea, 'Nice post!');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['comments'],
        });
      });
    });

    it('submits even with empty body (form allows empty submission)', async () => {
      render(<Comment comments={[]} slug={slug} />);

      const submitButton = screen.getByRole('button', { name: 'Post Comment' });
      await userEvent.click(submitButton);

      expect(mockCreateMutate).toHaveBeenCalledTimes(1);
      expect(mockCreateMutate).toHaveBeenCalledWith(
        { body: '', slug },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });
  });

  describe('delete button visibility', () => {
    it('shows delete button when current user is the comment author', () => {
      const comment = buildComment({ author: { ...currentUser, following: false } });
      render(<Comment comments={[comment]} slug={slug} />);

      const deleteButton = screen.getByTestId('delete-comment');
      expect(deleteButton).toBeInTheDocument();
    });

    it('does not show delete button when current user is not the comment author', () => {
      const comment = buildComment({
        author: { ...otherUser, following: false },
      });
      render(<Comment comments={[comment]} slug={slug} />);

      expect(screen.queryByTestId('delete-comment')).not.toBeInTheDocument();
    });

    it('shows delete button only on own comments when mixed authors are present', () => {
      const ownComment = buildComment({
        id: 1,
        body: 'My own comment',
        author: { ...currentUser, following: false },
      });
      const otherComment = buildComment({
        id: 2,
        body: 'Someone else comment',
        author: { ...otherUser, following: false },
      });

      render(<Comment comments={[ownComment, otherComment]} slug={slug} />);

      const deleteButtons = screen.getAllByTestId('delete-comment');
      expect(deleteButtons).toHaveLength(1);
    });
  });

  describe('delete comment action', () => {
    it('calls useDeleteCommentMutation().mutate with { slug, id } when delete button is clicked', async () => {
      const comment = buildComment({ id: 42, author: { ...currentUser, following: false } });
      render(<Comment comments={[comment]} slug={slug} />);

      const deleteButton = screen.getByTestId('delete-comment');
      await userEvent.click(deleteButton);

      expect(mockDeleteMutate).toHaveBeenCalledTimes(1);
      expect(mockDeleteMutate).toHaveBeenCalledWith(
        { slug, id: 42 },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });

    it('triggers comment cache invalidation after successful deletion', async () => {
      const comment = buildComment({ id: 7, author: { ...currentUser, following: false } });
      render(<Comment comments={[comment]} slug={slug} />);

      const deleteButton = screen.getByTestId('delete-comment');
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['comments'],
        });
      });
    });
  });

  describe('rendering', () => {
    it('renders the comment form with user avatar', () => {
      render(<Comment comments={[]} slug={slug} />);

      expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Post Comment' })).toBeInTheDocument();
      expect(screen.getByAltText('comment-author')).toBeInTheDocument();
    });

    it('renders all comments with author info and body', () => {
      const comments = [
        buildComment({ id: 1, body: 'First comment', author: { ...currentUser, following: false } }),
        buildComment({ id: 2, body: 'Second comment', author: { ...otherUser, following: false } }),
      ];

      render(<Comment comments={comments} slug={slug} />);

      expect(screen.getByText('First comment')).toBeInTheDocument();
      expect(screen.getByText('Second comment')).toBeInTheDocument();
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('otheruser')).toBeInTheDocument();
    });
  });
});