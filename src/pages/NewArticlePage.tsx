import { useEffect } from 'react';
import useInputs from '@/lib/hooks/useInputs';
import queryClient from '@/queries/queryClient';
import { useCreateArticleMutation } from '@/queries/articles.query';
import { QUERY_ARTICLES_KEY } from '@/constants/query.constant';
import { useNavigate } from 'react-router-dom';

const DRAFT_KEY_NEW = 'new-article-draft';

const NewArticlePage = () => {
  const navigate = useNavigate();
  const [articleData, onChangeArticleData, setArticleData] = useInputs({
    title: '',
    description: '',
    body: '',
    tag: '',
    tagList: [],
  });

  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY_NEW);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setArticleData((prev: any) => ({
          ...prev,
          title: draft.title || '',
          description: draft.description || '',
          body: draft.body || '',
          tagList: draft.tagList || [],
        }));
      } catch (error) {
        console.error('Failed to parse draft:', error);
      }
    }
  }, []);

  useEffect(() => {
    const { title, description, body, tagList } = articleData;
    const draft = { title, description, body, tagList };
    localStorage.setItem(DRAFT_KEY_NEW, JSON.stringify(draft));
  }, [articleData.title, articleData.description, articleData.body, articleData.tagList]);

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY_NEW);
    setArticleData({
      title: '',
      description: '',
      body: '',
      tag: '',
      tagList: [],
    });
  };

  const onEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!articleData.tagList.includes(articleData.tag)) {
        addTag(articleData.tag);
      }
    }
  };

  const addTag = (newTag: string) => {
    setArticleData({
      ...articleData,
      tag: '',
      tagList: [...articleData.tagList, newTag],
    });
  };

  const removeTag = (target: string) => {
    setArticleData({ ...articleData, tagList: articleData.tagList.filter((tag: string) => tag !== target) });
  };

  const createArticleMutation = useCreateArticleMutation();

  const onPublish = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { title, description, body, tagList } = articleData;
    createArticleMutation.mutate(
      { title, description, body, tagList },
      {
        onSuccess: (res) => {
          queryClient.invalidateQueries({ queryKey: [QUERY_ARTICLES_KEY] });
          localStorage.removeItem(DRAFT_KEY_NEW);
          const slug = res.data.article.slug;
          navigate(`/article/${slug}`, { state: slug });
        },
      },
    );
  };

  return (
    <div className="editor-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-10 offset-md-1 col-xs-12">
            <form onSubmit={onPublish}>
              <fieldset>
                <fieldset className="form-group">
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Article Title"
                    name="title"
                    value={articleData.title}
                    onChange={onChangeArticleData}
                  />
                </fieldset>
                <fieldset className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="What's this article about?"
                    name="description"
                    value={articleData.description}
                    onChange={onChangeArticleData}
                  />
                </fieldset>
                <fieldset className="form-group">
                  <textarea
                    className="form-control"
                    rows={8}
                    placeholder="Write your article (in markdown)"
                    name="body"
                    value={articleData.body}
                    onChange={onChangeArticleData}
                  ></textarea>
                </fieldset>
                <fieldset className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter tags"
                    name="tag"
                    value={articleData.tag}
                    onChange={onChangeArticleData}
                    onKeyDown={onEnter}
                  />
                </fieldset>
                <div className="tag-list">
                  {articleData.tagList.map((tag: string) => (
                    <span className="tag-default tag-pill" key={tag}>
                      <i
                        role="presentation"
                        className="ion-close-round"
                        style={{ cursor: 'pointer', marginRight: '5px' }}
                        onClick={() => removeTag(tag)}
                      />{' '}
                      {tag}{' '}
                    </span>
                  ))}
                </div>
                <button className="btn btn-lg pull-xs-right btn-primary" type="submit">
                  Publish Article
                </button>
                <button
                  className="btn btn-lg pull-xs-right btn-secondary"
                  type="button"
                  onClick={clearDraft}
                  style={{ marginRight: '10px' }}
                >
                  Clear Draft
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewArticlePage;
