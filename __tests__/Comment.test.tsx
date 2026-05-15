import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Comment from '@/components/article/Comment';
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

const mockUser = {
  username: 'testuser',
  image: 'https://example.com/avatar.png',
  bio: '',
};

const mockCommentByCurrentUser: IComment = {
  id: 1,
  createdAt: '2023-02-15T16:38:09.644Z',
  updatedAt: '2023-02-15T16:38:09.644Z',
  body: 'A test comment',
  author: {
    username: 'testuser',
    bio: '',
    image: 'https://example.com/avatar.png',
    following: false,
  },
};

const mockCommentByOtherUser: IComment = {
  id: 2,
  createdAt: '2023-03-20T10:00:00.000Z',
  updatedAt: '2023-03-20T10:00:00.000Z',
  body: 'Another comment',
  author: {
    username: 'otheruser',
    bio: '',
    image: 'https://example.com/other.png',
    following: false,
  },
};

const setupMocks = (overrides: Partial<{
  createMutate: jest.Mock;
  deleteMutate: jest.Mock;
  userData: typeof mockUser;
}> = {}) => {
  const createMutate = overrides.createMutate ?? jest.fn();
  const deleteMutate = overrides.deleteMutate ?? jest.fn();
  const userData = overrides.userData ?? mockUser;

  (useCreateCommentMutation as jest.Mock).mockReturnValue({ mutate: createMutate });
  (useDeleteCommentMutation as jest.Mock).mockReturnValue({ mutate: deleteMutate });
  (useGetUserQuery as jest.Mock).mockReturnValue({ data: userData });

  return { createMutate, deleteMutate };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Comment', () => {
  describe('comment submission', () => {
    it('calls useCreateCommentMutation().mutate with { body, slug } when submitting a comment', () => {
      const { createMutate } = setupMocks();

      render(<Comment comments={[]} slug="test-slug" />);

      const textarea = screen.getByPlaceholderText('Write a comment...');
      act(() => {
        userEvent.type(textarea, 'Hello world');
      });

      const submitButton = screen.getByRole('button', { name: /post comment/i });
      act(() => {
        userEvent.click(submitButton);
      });

      expect(createMutate).toHaveBeenCalledTimes(1);
      expect(createMutate).toHaveBeenCalledWith(
        { body: 'Hello world', slug: 'test-slug' },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      );
    });

    it('clears the input and invalidates comments cache after successful submission', () => {
      const { createMutate } = setupMocks();

      render(<Comment comments={[]} slug="test-slug" />);

      const textarea = screen.getByPlaceholderText('Write a comment...');
      act(() => {
        userEvent.type(textarea, 'Hello world');
      });

      const submitButton = screen.getByRole('button', { name: /post comment/i });
      act(() => {
        userEvent.click(submitButton);
      });

      const onSuccess = createMutate.mock.calls[0][1].onSuccess;
      act(() => {
        onSuccess({});
      });

      expect(textarea).toHaveValue('');
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['comments'],
      });
    });
  });

  describe('comment deletion', () => {
    it('shows delete button when current user is the comment author and calls useDeleteCommentMutation().mutate on click', () => {
      const { deleteMutate } = setupMocks();

      render(<Comment comments={[mockCommentByCurrentUser]} slug="test-slug" />);

      const deleteButton = screen.getByLabelText('delete-comment');
      expect(deleteButton).toBeInTheDocument();

      act(() => {
        userEvent.click(deleteButton);
      });

      expect(deleteMutate).toHaveBeenCalledTimes(1);
      expect(deleteMutate).toHaveBeenCalledWith(
        { slug: 'test-slug', id: 1 },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      );
    });

    it('does not show delete button when current user is not the comment author', () => {
      setupMocks();

      render(<Comment comments={[mockCommentByOtherUser]} slug="test-slug" />);

      expect(screen.queryByLabelText('delete-comment')).not.toBeInTheDocument();
    });
  });
});
