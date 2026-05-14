import '@testing-library/jest-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Comment from '../src/components/article/Comment';
import queryClient from '../src/queries/queryClient';
import { useCreateCommentMutation, useDeleteCommentMutation } from '../src/queries/articles.query';
import { useGetUserQuery } from '../src/queries/user.query';
import { QUERY_COMMENTS_KEY } from '../src/constants/query.constant';
import { IComment } from '../src/interfaces/main';

jest.mock('../src/queries/articles.query', () => ({
  useCreateCommentMutation: jest.fn(),
  useDeleteCommentMutation: jest.fn(),
}));

jest.mock('../src/queries/user.query', () => ({
  useGetUserQuery: jest.fn(),
}));

jest.mock('../src/queries/queryClient', () => ({
  __esModule: true,
  default: {
    invalidateQueries: jest.fn(),
  },
}));

type CommentOverrides = Omit<Partial<IComment>, 'author'> & {
  author?: Partial<IComment['author']>;
};

const mockedUseCreateCommentMutation = useCreateCommentMutation as jest.Mock;
const mockedUseDeleteCommentMutation = useDeleteCommentMutation as jest.Mock;
const mockedUseGetUserQuery = useGetUserQuery as jest.Mock;
const mockedQueryClient = queryClient as jest.Mocked<typeof queryClient>;

const createCommentMutate = jest.fn();
const deleteCommentMutate = jest.fn();

const buildAuthor = (overrides: Partial<IComment['author']> = {}): IComment['author'] => ({
  username: 'author-user',
  bio: 'comment bio',
  image: 'https://example.com/comment-author.png',
  following: false,
  ...overrides,
});

const buildComment = (overrides: CommentOverrides = {}): IComment => {
  const { author, ...restOverrides } = overrides;

  return {
    id: 1,
    createdAt: '2023-02-15T16:38:09.644Z',
    updatedAt: '2023-02-15T16:38:09.644Z',
    body: 'Existing comment',
    author: buildAuthor(author),
    ...restOverrides,
  };
};

const renderComment = ({
  currentUsername = 'current-user',
  comments = [buildComment()],
  slug = 'test-article',
}: {
  currentUsername?: string;
  comments?: IComment[];
  slug?: string;
} = {}) => {
  mockedUseGetUserQuery.mockReturnValue({
    data: {
      username: currentUsername,
      image: 'https://example.com/current-user.png',
    },
  });

  mockedUseCreateCommentMutation.mockReturnValue({
    mutate: createCommentMutate,
  });
  mockedUseDeleteCommentMutation.mockReturnValue({
    mutate: deleteCommentMutate,
  });

  return render(<Comment comments={comments} slug={slug} />);
};

beforeEach(() => {
  createCommentMutate.mockReset();
  deleteCommentMutate.mockReset();
  mockedQueryClient.invalidateQueries.mockReset();
  mockedUseCreateCommentMutation.mockReset();
  mockedUseDeleteCommentMutation.mockReset();
  mockedUseGetUserQuery.mockReset();
});

describe('Comment', () => {
  test('输入评论后提交时会调用 create comment mutate 并传入 body 与 slug', async () => {
    renderComment({ slug: 'react-query-realworld' });

    const textarea = screen.getByPlaceholderText('Write a comment...');
    const submitButton = screen.getByRole('button', { name: 'Post Comment' });

    userEvent.type(textarea, 'A focused integration-style test');
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(createCommentMutate).toHaveBeenCalledWith(
        { body: 'A focused integration-style test', slug: 'react-query-realworld' },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });
  });

  test('提交成功后会清空输入框并刷新评论缓存', async () => {
    renderComment({ slug: 'cache-refresh-article' });

    const textarea = screen.getByPlaceholderText('Write a comment...') as HTMLTextAreaElement;
    const submitButton = screen.getByRole('button', { name: 'Post Comment' });

    userEvent.type(textarea, 'Reset me after success');
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(createCommentMutate).toHaveBeenCalledTimes(1);
    });

    const [, mutationOptions] = createCommentMutate.mock.calls[0];

    act(() => {
      mutationOptions.onSuccess({});
    });

    await waitFor(() => {
      expect(textarea).toHaveValue('');
    });

    expect(mockedQueryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [QUERY_COMMENTS_KEY],
    });
  });

  test('当前登录用户是评论作者时显示删除按钮，点击后调用 delete comment mutate', async () => {
    const ownComment = buildComment({
      id: 9,
      author: {
        username: 'same-user',
      },
    });

    const { container } = renderComment({
      currentUsername: 'same-user',
      comments: [ownComment],
      slug: 'delete-article',
    });

    const deleteButton = container.querySelector('.ion-trash-a');

    expect(deleteButton).toBeInTheDocument();

    userEvent.click(deleteButton as Element);

    await waitFor(() => {
      expect(deleteCommentMutate).toHaveBeenCalledWith(
        { slug: 'delete-article', id: 9 },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });
  });

  test('当前登录用户不是评论作者时不显示删除入口', () => {
    const otherUserComment = buildComment({
      author: {
        username: 'comment-owner',
      },
    });

    const { container } = renderComment({
      currentUsername: 'viewer-user',
      comments: [otherUserComment],
    });

    expect(container.querySelector('.ion-trash-a')).not.toBeInTheDocument();
  });
});
