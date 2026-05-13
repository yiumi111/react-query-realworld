import useInputs from '@/lib/hooks/useInputs';
import queryClient from '@/queries/queryClient';
import { useCreateArticleMutation } from '@/queries/articles.query';
import { QUERY_ARTICLES_KEY } from '@/constants/query.constant';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';

const DRAFT_KEY = 'article_draft_new';

const NewArticlePage = () => {
  const navigate = useNavigate();

  const initialState = useMemo(() => {
    const defaultState = {
      title: '',
      description: '',
      body: '',
      tag: '',
      tagList: [],
    };
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        return {
          ...defaultState,
          title: parsed.title || '',
          description: parsed.description || '',
          body: parsed.body || '',
          tagList: parsed.tagList || [],
        };
      } catch (e) {
        return defaultState;
      }
    }
    return defaultState;
  }, []);

  const [articleData, onChangeArticleData, setArticleData] = useInputs(initialState);

  useEffect(() => {
    const draftToSave = {
      title: articleData.title,
      description: articleData.description,
      body: articleData.body,
      tagList: articleData.tagList,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftToSave));
  }, [articleData.title, articleData.description, articleData.body, articleData.tagList]);

  const onClearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
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
                  className="btn btn-lg pull-xs-right btn-outline-secondary" 
                  type="button" 
                  style={{ marginRight: '10px' }}
                  onClick={onClearDraft}
                >
                  清空草稿
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
