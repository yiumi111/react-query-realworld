import { QUERY_ARTICLES_KEY } from '@/constants/query.constant';
import useInputs from '@/lib/hooks/useInputs';
import { useCreateArticleMutation } from '@/queries/articles.query';
import queryClient from '@/queries/queryClient';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

type ArticleDraftForm = {
  title: string;
  description: string;
  body: string;
  tag: string;
  tagList: string[];
};

const EMPTY_ARTICLE_DATA: ArticleDraftForm = {
  title: '',
  description: '',
  body: '',
  tag: '',
  tagList: [],
};

const NEW_ARTICLE_DRAFT_KEY = 'article-draft:new';

const isDraftStorageAvailable = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const isArticleDraftEmpty = ({ title, description, body, tag, tagList }: ArticleDraftForm) => {
  return !title.trim() && !description.trim() && !body.trim() && !tag.trim() && tagList.length === 0;
};

const normalizeArticleDraft = (draft: Partial<ArticleDraftForm>): ArticleDraftForm => ({
  title: typeof draft.title === 'string' ? draft.title : '',
  description: typeof draft.description === 'string' ? draft.description : '',
  body: typeof draft.body === 'string' ? draft.body : '',
  tag: typeof draft.tag === 'string' ? draft.tag : '',
  tagList: Array.isArray(draft.tagList) ? draft.tagList.filter((tag): tag is string => typeof tag === 'string') : [],
});

const readArticleDraft = (draftKey: string): ArticleDraftForm | null => {
  if (!isDraftStorageAvailable()) {
    return null;
  }

  try {
    const savedDraft = window.localStorage.getItem(draftKey);

    if (!savedDraft) {
      return null;
    }

    const parsedDraft = JSON.parse(savedDraft) as Partial<ArticleDraftForm>;

    if (!parsedDraft || typeof parsedDraft !== 'object') {
      return null;
    }

    return normalizeArticleDraft(parsedDraft);
  } catch {
    return null;
  }
};

const persistArticleDraft = (draftKey: string, draft: ArticleDraftForm) => {
  if (!isDraftStorageAvailable()) {
    return;
  }

  if (isArticleDraftEmpty(draft)) {
    window.localStorage.removeItem(draftKey);
    return;
  }

  window.localStorage.setItem(draftKey, JSON.stringify(draft));
};

const clearArticleDraft = (draftKey: string) => {
  if (!isDraftStorageAvailable()) {
    return;
  }

  window.localStorage.removeItem(draftKey);
};

const NewArticlePage = () => {
  const navigate = useNavigate();
  const initialDraft = useMemo(() => readArticleDraft(NEW_ARTICLE_DRAFT_KEY) ?? EMPTY_ARTICLE_DATA, []);
  const [articleData, , setArticleData] = useInputs(initialDraft) as [
    ArticleDraftForm,
    (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void,
    (value: ArticleDraftForm) => void,
  ];

  const updateArticleData = (nextArticleData: ArticleDraftForm) => {
    setArticleData(nextArticleData);
    persistArticleDraft(NEW_ARTICLE_DRAFT_KEY, nextArticleData);
  };

  const onChangeArticleData = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    updateArticleData({
      ...articleData,
      [event.target.name]: event.target.value,
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
    updateArticleData({
      ...articleData,
      tag: '',
      tagList: [...articleData.tagList, newTag],
    });
  };

  const removeTag = (target: string) => {
    updateArticleData({ ...articleData, tagList: articleData.tagList.filter((tag) => tag !== target) });
  };

  const onClearDraft = () => {
    clearArticleDraft(NEW_ARTICLE_DRAFT_KEY);
    setArticleData(EMPTY_ARTICLE_DATA);
  };

  const createArticleMutation = useCreateArticleMutation();

  const onPublish = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { title, description, body, tagList } = articleData;
    createArticleMutation.mutate(
      { title, description, body, tagList },
      {
        onSuccess: (res) => {
          clearArticleDraft(NEW_ARTICLE_DRAFT_KEY);
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
                  {articleData.tagList.map((tag) => (
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
                <div className="pull-xs-right">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    style={{ marginRight: '10px', marginTop: '10px' }}
                    type="button"
                    onClick={onClearDraft}
                  >
                    Clear Draft
                  </button>
                  <button className="btn btn-lg btn-primary" type="submit">
                    Publish Article
                  </button>
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewArticlePage;
