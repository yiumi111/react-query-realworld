import { useEffect, useRef, useCallback } from 'react';
import useInputs from '@/lib/hooks/useInputs';
import queryClient from '@/queries/queryClient';
import { useUpdateArticleMutation } from '@/queries/articles.query';
import { QUERY_ARTICLE_KEY } from '@/constants/query.constant';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getDraftEditArticle,
  setDraftEditArticle,
  removeDraftEditArticle,
  DraftArticle,
} from '@/lib/utils/draft';

const EditArticlePage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const slug = state?.slug;

  const [articleData, onChangeArticleData, setArticleData] = useInputs({
    slug: slug || '',
    title: state?.title || '',
    description: state?.description || '',
    body: state?.body || '',
    tag: '',
    tagList: state?.tagList || [],
  });

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const saveDraft = useCallback(
    (data: DraftArticle) => {
      if (!slug) return;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        setDraftEditArticle(slug, data);
      }, 500);
    },
    [slug],
  );

  useEffect(() => {
    if (!slug) return;
    const draft = getDraftEditArticle(slug);
    if (draft) {
      setArticleData({
        slug,
        title: draft.title,
        description: draft.description,
        body: draft.body,
        tag: '',
        tagList: draft.tagList,
      });
    }
  }, [slug, setArticleData]);

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
    if (slug) {
      removeDraftEditArticle(slug);
    }
    setArticleData({
      slug: slug || '',
      title: state?.title || '',
      description: state?.description || '',
      body: state?.body || '',
      tag: '',
      tagList: state?.tagList || [],
    });
  };

  const updateArticleMutation = useUpdateArticleMutation();

  const onUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { slug: currentSlug, title, description, body, tagList } = articleData;
    updateArticleMutation.mutate(
      { slug: currentSlug, title, description, body, tagList },
      {
        onSuccess: (res) => {
          queryClient.invalidateQueries({ queryKey: [QUERY_ARTICLE_KEY] });
          if (currentSlug) {
            removeDraftEditArticle(currentSlug);
          }
          const newSlug = res.data.article.slug;
          navigate(`/article/${newSlug}`, { state: newSlug });
        },
      },
    );
  };

  const hasDraft = slug ? !!getDraftEditArticle(slug) : false;

  return (
    <div className="editor-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-10 offset-md-1 col-xs-12">
            {hasDraft && (
              <div className="alert alert-info" style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>检测到已保存的草稿</span>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={clearDraft}>
                  清空草稿
                </button>
              </div>
            )}
            <form onSubmit={onUpdate}>
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
                  Update Article
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditArticlePage;