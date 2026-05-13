import { QUERY_ARTICLE_KEY } from '@/constants/query.constant';
import type { IArticle } from '@/interfaces/main';
import useInputs from '@/lib/hooks/useInputs';
import queryClient from '@/queries/queryClient';
import { useUpdateArticleMutation } from '@/queries/articles.query';
import { getArticle } from '@/repositories/articles/articlesRepository';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

type EditArticleForm = {
  slug: string;
  title: string;
  description: string;
  body: string;
  tag: string;
  tagList: string[];
};

type EditArticleDraft = Omit<EditArticleForm, 'slug'>;

const EMPTY_EDIT_ARTICLE_DATA: EditArticleForm = {
  slug: '',
  title: '',
  description: '',
  body: '',
  tag: '',
  tagList: [],
};

const isDraftStorageAvailable = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const getEditArticleDraftKey = (slug: string) => `article-draft:edit:${slug}`;

const isEditArticleDraftEmpty = ({ title, description, body, tag, tagList }: EditArticleDraft) => {
  return !title.trim() && !description.trim() && !body.trim() && !tag.trim() && tagList.length === 0;
};

const normalizeEditArticleDraft = (draft: Partial<EditArticleDraft>): EditArticleDraft => ({
  title: typeof draft.title === 'string' ? draft.title : '',
  description: typeof draft.description === 'string' ? draft.description : '',
  body: typeof draft.body === 'string' ? draft.body : '',
  tag: typeof draft.tag === 'string' ? draft.tag : '',
  tagList: Array.isArray(draft.tagList) ? draft.tagList.filter((tag): tag is string => typeof tag === 'string') : [],
});

const createEditArticleData = (
  article: Pick<IArticle, 'slug' | 'title' | 'description' | 'body' | 'tagList'>,
): EditArticleForm => ({
  slug: article.slug,
  title: article.title,
  description: article.description,
  body: article.body,
  tag: '',
  tagList: article.tagList,
});

const toEditArticleDraft = ({ title, description, body, tag, tagList }: EditArticleForm): EditArticleDraft => ({
  title,
  description,
  body,
  tag,
  tagList,
});

const readEditArticleDraft = (slug: string): EditArticleDraft | null => {
  if (!slug || !isDraftStorageAvailable()) {
    return null;
  }

  try {
    const savedDraft = window.localStorage.getItem(getEditArticleDraftKey(slug));

    if (!savedDraft) {
      return null;
    }

    const parsedDraft = JSON.parse(savedDraft) as Partial<EditArticleDraft>;

    if (!parsedDraft || typeof parsedDraft !== 'object') {
      return null;
    }

    return normalizeEditArticleDraft(parsedDraft);
  } catch {
    return null;
  }
};

const persistEditArticleDraft = (slug: string, draft: EditArticleDraft) => {
  if (!slug || !isDraftStorageAvailable()) {
    return;
  }

  if (isEditArticleDraftEmpty(draft)) {
    window.localStorage.removeItem(getEditArticleDraftKey(slug));
    return;
  }

  window.localStorage.setItem(getEditArticleDraftKey(slug), JSON.stringify(draft));
};

const clearEditArticleDraft = (slug: string) => {
  if (!slug || !isDraftStorageAvailable()) {
    return;
  }

  window.localStorage.removeItem(getEditArticleDraftKey(slug));
};

const EditArticlePage = () => {
  const { state } = useLocation();
  const { slug: slugParam = '' } = useParams();
  const navigate = useNavigate();
  const hydratedSlugRef = useRef('');
  const articleFromState = (state ?? null) as Pick<
    IArticle,
    'slug' | 'title' | 'description' | 'body' | 'tagList'
  > | null;
  const currentSlug = articleFromState?.slug ?? slugParam;
  const initialDraft = useMemo(() => readEditArticleDraft(currentSlug), [currentSlug]);
  const [articleData, , setArticleData] = useInputs(
    initialDraft
      ? { slug: currentSlug, ...initialDraft }
      : articleFromState
      ? createEditArticleData(articleFromState)
      : { ...EMPTY_EDIT_ARTICLE_DATA, slug: currentSlug },
  ) as [
    EditArticleForm,
    (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void,
    (value: EditArticleForm) => void,
  ];

  const articleQuery = useQuery({
    queryKey: [QUERY_ARTICLE_KEY, currentSlug],
    queryFn: () => getArticle({ slug: currentSlug }).then((res) => res.data.article),
    enabled: !!currentSlug && !articleFromState?.slug,
    staleTime: 20000,
  });

  const sourceArticle = articleFromState ?? articleQuery.data;

  useEffect(() => {
    if (!currentSlug || hydratedSlugRef.current === currentSlug) {
      return;
    }

    const savedDraft = readEditArticleDraft(currentSlug);

    if (savedDraft) {
      setArticleData({ slug: currentSlug, ...savedDraft });
      hydratedSlugRef.current = currentSlug;
      return;
    }

    if (sourceArticle) {
      setArticleData(createEditArticleData(sourceArticle));
      hydratedSlugRef.current = currentSlug;
    }
  }, [currentSlug, setArticleData, sourceArticle]);

  const updateArticleData = (nextArticleData: EditArticleForm) => {
    setArticleData(nextArticleData);
    persistEditArticleDraft(nextArticleData.slug || currentSlug, toEditArticleDraft(nextArticleData));
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
    clearEditArticleDraft(articleData.slug || currentSlug);
    hydratedSlugRef.current = '';
    setArticleData(
      sourceArticle ? createEditArticleData(sourceArticle) : { ...EMPTY_EDIT_ARTICLE_DATA, slug: currentSlug },
    );
  };

  const updateArticleMutation = useUpdateArticleMutation();

  const onUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { slug, title, description, body, tagList } = articleData;
    updateArticleMutation.mutate(
      { slug, title, description, body, tagList },
      {
        onSuccess: (res) => {
          clearEditArticleDraft(slug);
          queryClient.invalidateQueries({ queryKey: [QUERY_ARTICLE_KEY] });
          const newSlug = res.data.article.slug;
          navigate(`/article/${newSlug}`, { state: newSlug });
        },
      },
    );
  };

  return (
    <div className="editor-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-10 offset-md-1 col-xs-12">
            <form onSubmit={onUpdate}>
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
                    Update Article
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

export default EditArticlePage;
