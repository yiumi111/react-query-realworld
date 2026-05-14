import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Comment from '../Comment';

// Mock dependencies
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

// We don't mock useInputs to test real interaction with the textarea
// but we need to import the mocked modules to set their return values
import { useCreateCommentMutation, useDeleteCommentMutation } from '@/queries/articles.query';
import { useGetUserQuery } from '@/queries/user.query';
import queryClient from '@/queries/queryClient';
import { QUERY_COMMENTS_KEY } from '@/constants/query.constant';

describe('Comment Component', () => {
  const mockMutateCreate = jest.fn();
  const mockMutateDelete = jest.fn();

  const defaultProps = {
    slug: 'test-slug',
    comments: [
      {
        id: 1,
        body: 'First comment',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        author: {
          username: 'author-user',
          bio: 'Bio',
          image: 'author-image.jpg',
          following: false,
        },
      },
      {
        id: 2,
        body: 'Second comment',
        createdAt: '2023-01-02T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        author: {
          username: 'other-user',
          bio: 'Bio',
          image: 'other-image.jpg',
          following: false,
        },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useCreateCommentMutation as jest.Mock).mockReturnValue({
      mutate: mockMutateCreate,
    });

    (useDeleteCommentMutation as jest.Mock).mockReturnValue({
      mutate: mockMutateDelete,
    });

    (useGetUserQuery as jest.Mock).mockReturnValue({
      data: {
        username: 'author-user',
        image: 'current-user-image.jpg',
      },
    });
  });

  it('calls createCommentMutation and invalidates cache on successful comment post', async () => {
    // Setup mutate to call onSuccess callback
    mockMutateCreate.mockImplementation((params, options) => {
      if (options && options.onSuccess) {
        options.onSuccess();
      }
    });

    render(<Comment {...defaultProps} />);

    const textarea = screen.getByPlaceholderText('Write a comment...');
    const submitButton = screen.getByRole('button', { name: /Post Comment/i });

    // Simulate typing a new comment
    userEvent.type(textarea, 'This is a new comment');
    expect(textarea).toHaveValue('This is a new comment');

    // Submit form
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateCreate).toHaveBeenCalledWith(
        { body: 'This is a new comment', slug: 'test-slug' },
        expect.any(Object)
      );
    });

    // Check if textarea is cleared
    expect(textarea).toHaveValue('');

    // Check if cache is invalidated
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [QUERY_COMMENTS_KEY],
    });
  });

  it('shows delete button if current user is the author and calls delete mutation on click', async () => {
    // Setup mutate to call onSuccess callback
    mockMutateDelete.mockImplementation((params, options) => {
      if (options && options.onSuccess) {
        options.onSuccess();
      }
    });

    render(<Comment {...defaultProps} />);

    // 'author-user' is the author of the first comment, so one delete button should be present
    const deleteButtons = screen.queryAllByTestId('delete-comment-btn');
    expect(deleteButtons).toHaveLength(1);

    // Click the delete button
    userEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockMutateDelete).toHaveBeenCalledWith(
        { slug: 'test-slug', id: 1 },
        expect.any(Object)
      );
    });

    // Check if cache is invalidated
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [QUERY_COMMENTS_KEY],
    });
  });

  it('does not show delete button if current user is not the author', () => {
    // Change current user to someone else
    (useGetUserQuery as jest.Mock).mockReturnValue({
      data: {
        username: 'different-user',
        image: 'different-user-image.jpg',
      },
    });

    render(<Comment {...defaultProps} />);

    // 'different-user' is not the author of any comment, so no delete buttons should be present
    const deleteButtons = screen.queryAllByTestId('delete-comment-btn');
    expect(deleteButtons).toHaveLength(0);
  });
});
