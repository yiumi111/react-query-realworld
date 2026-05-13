import { useEffect, useRef, useCallback } from 'react';
import useInputs from '@/lib/hooks/useInputs';
import queryClient from '@/queries/queryClient';
import { useCreateArticleMutation } from '@/queries/articles.query';
import { QUERY_ARTICLES_KEY } from '@/constants/query.constant';
import { useNavigate } from 'react-router-dom';
import {
  getDraftNewArticle,
  setDraftNewArticle,
  removeDraftNewArticle,
  DraftArticle,
} from '@/lib/utils/draft';

const NewArticlePage = () => {
  const navigate = useNavigate();
  const [articleData, onChangeArticleData, setArticleData] = useInputs({
    title: '',
    description: '',
    body: '',
    tag: '',
    tagList: [],
  });

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const saveDraft = useCallback((data: DraftArticle) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDraftNewArticle(data);
    }, 500);
  }, []);

  useEffect(() => {
    const draft = getDraftNewArticle();
    if (draft) {
      setArticleData({
        title: draft.title,
        description: draft.description,
        body: draft.body,
        tag: '',
        tagList: draft.tagList,
      });
    }
  }, [setArticleData]);

  const onEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!articleData.tagList.includes(articleData.tag)) {
        addTag(articleData.tag);
      }
    }
  };

  const addTag = (newTag: string) => {
    const newData = {
      ...articleData,
      tag: '',
      tagList: [...articleData.tagList, newTag],
    };
    setArticleData(newData);
    saveDraft({
      title: newData.title,
      description: newData.description,
      body: newData.body,
      tagList: newData.tagList,
    });
  };

  const removeTag = (target: string) => {
    const newData = {
      ...articleData,
      tagList: articleData.tagList.filter((tag: string) => tag !== target),
    };
    setArticleData(newData);
    saveDraft({
      title: newData.title,
      description: newData.description,
      body: newData.body,
      tagList: newData.tagList,
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    onChangeArticleData(event);
    const { title, description, body, tagList } = articleData;
    saveDraft({ title, description, body, tagList });
  };

  const clearDraft = () => {
    removeDraftNewArticle();
    setArticleData({
      title: '',
      description: '',
      body: '',
      tag: '',
      tagList: [],
    });
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
          removeDraftNewArticle();
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
            {getDraftNewArticle() && (
              <div className="alert alert-info" style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>检测到已保存的草稿</span>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={clearDraft}>
                  清空草稿
                </button>
              </div>
            )}
            <form onSubmit={onPublish}>
              <fieldset>
                <fieldset className="form-group">
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Article Title"
                    name="title"
                    value={articleData.title}
                    onChange={handleChange}
                  />
                </fieldset>
                <fieldset className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="What's this article about?"
                    name="description"
                    value={articleData.description}
                    onChange={handleChange}
                  />
                </fieldset>
                <fieldset className="form-group">
                  <textarea
                    className="form-control"
                    rows={8}
                    placeholder="Write your article (in markdown)"
                    name="body"
                    value={articleData.body}
                    onChange={handleChange}
                  ></textarea>
                </fieldset>
                <fieldset className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter tags"
                    name="tag"
                    value={articleData.tag}
                    onChange={handleChange}
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
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewArticlePage;