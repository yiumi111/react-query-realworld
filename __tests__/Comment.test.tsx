import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Comment from '@/components/article/Comment';
import { useCreateCommentMutation, useDeleteCommentMutation } from '@/queries/articles.query';
import { useGetUserQuery } from '@/queries/user.query';
import queryClient from '@/queries/queryClient';
import { QUERY_COMMENTS_KEY } from '@/constants/query.constant';

jest.mock('@/queries/articles.query');
jest.mock('@/queries/user.query');
jest.mock('@/queries/queryClient');

const mockUseGetUserQuery = useGetUserQuery as jest.MockedFunction<typeof useGetUserQuery>;
const mockUseCreateCommentMutation = useCreateCommentMutation as jest.MockedFunction<typeof useCreateCommentMutation>;
const mockUseDeleteCommentMutation = useDeleteCommentMutation as jest.MockedFunction<typeof useDeleteCommentMutation>;
const mockQueryClient = queryClient as jest.Mocked<typeof queryClient>;

const mockUser = {
  username: 'testuser',
  image: 'https://example.com/avatar.jpg',
  bio: 'test bio',
};

const mockComments = [
  {
    id: 1,
    body: 'Test comment 1',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    author: {
      username: 'testuser',
      image: 'https://example.com/avatar.jpg',
      bio: 'test bio',
      following: false,
    },
  },
  {
    id: 2,
    body: 'Test comment 2',
    createdAt: '2023-01-02T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z',
    author: {
      username: 'otheruser',
      image: 'https://example.com/otheravatar.jpg',
      bio: 'other bio',
      following: false,
    },
  },
];

const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithQueryClient = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('Comment Component', () => {
  let mockMutateCreate: jest.Mock;
  let mockMutateDelete: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockMutateCreate = jest.fn();
    mockMutateDelete = jest.fn();

    mockUseGetUserQuery.mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false,
    } as any);

    mockUseCreateCommentMutation.mockReturnValue({
      mutate: mockMutateCreate,
      isLoading: false,
      isError: false,
    } as any);

    mockUseDeleteCommentMutation.mockReturnValue({
      mutate: mockMutateDelete,
      isLoading: false,
      isError: false,
    } as any);

    (mockQueryClient.invalidateQueries as jest.Mock).mockResolvedValue(undefined);
  });

  describe('提交评论功能', () => {
    it('输入评论后提交时会调用 useCreateCommentMutation().mutate 并传入正确参数', () => {
      const testSlug = 'test-article-slug';
      renderWithQueryClient(<Comment comments={[]} slug={testSlug} />);

      const input = screen.getByTestId('comment-input');
      const form = screen.getByTestId('comment-form');

      fireEvent.change(input, { target: { name: 'body', value: 'Test comment content' } });
      fireEvent.submit(form);

      expect(mockMutateCreate).toHaveBeenCalledWith(
        { body: 'Test comment content', slug: testSlug },
        expect.any(Object)
      );
    });

    it('提交成功后会清空输入框并触发评论缓存刷新', async () => {
      const testSlug = 'test-article-slug';
      
      mockUseCreateCommentMutation.mockReturnValue({
        mutate: (variables: any, options?: any) => {
          options?.onSuccess?.({});
        },
        isLoading: false,
        isError: false,
      } as any);

      renderWithQueryClient(<Comment comments={[]} slug={testSlug} />);

      const input = screen.getByTestId('comment-input');
      const form = screen.getByTestId('comment-form');

      fireEvent.change(input, { target: { name: 'body', value: 'Test comment content' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: [QUERY_COMMENTS_KEY],
      });
    });
  });

  describe('删除评论功能', () => {
    it('当前登录用户是评论作者时显示删除按钮', () => {
      renderWithQueryClient(<Comment comments={mockComments} slug="test-article-slug" />);

      const deleteBtn1 = screen.getByTestId('delete-comment-btn-1');
      expect(deleteBtn1).toBeInTheDocument();

      expect(screen.queryByTestId('delete-comment-btn-2')).not.toBeInTheDocument();
    });

    it('当前登录用户不是作者时不显示删除按钮', () => {
      mockUseGetUserQuery.mockReturnValue({
        data: { ...mockUser, username: 'differentuser' },
        isLoading: false,
        isError: false,
      } as any);

      renderWithQueryClient(<Comment comments={mockComments} slug="test-article-slug" />);

      expect(screen.queryByTestId('delete-comment-btn-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('delete-comment-btn-2')).not.toBeInTheDocument();
    });

    it('点击删除按钮后调用 useDeleteCommentMutation().mutate 并传入正确参数', () => {
      const testSlug = 'test-article-slug';
      renderWithQueryClient(<Comment comments={mockComments} slug={testSlug} />);

      const deleteBtn = screen.getByTestId('delete-comment-btn-1');
      fireEvent.click(deleteBtn);

      expect(mockMutateDelete).toHaveBeenCalledWith(
        { slug: testSlug, id: 1 },
        expect.any(Object)
      );
    });

    it('删除成功后触发评论缓存刷新', async () => {
      const testSlug = 'test-article-slug';
      
      mockUseDeleteCommentMutation.mockReturnValue({
        mutate: (variables: any, options?: any) => {
          options?.onSuccess?.({});
        },
        isLoading: false,
        isError: false,
      } as any);

      renderWithQueryClient(<Comment comments={mockComments} slug={testSlug} />);

      const deleteBtn = screen.getByTestId('delete-comment-btn-1');
      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: [QUERY_COMMENTS_KEY],
        });
      });
    });
  });
});
