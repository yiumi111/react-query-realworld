const DRAFT_NEW_ARTICLE_KEY = 'draft_new_article';
const DRAFT_EDIT_ARTICLE_PREFIX = 'draft_edit_article_';

export interface DraftArticle {
  title: string;
  description: string;
  body: string;
  tagList: string[];
}

const getDraftNewArticle = (): DraftArticle | null => {
  const draft = localStorage.getItem(DRAFT_NEW_ARTICLE_KEY);
  return draft ? JSON.parse(draft) : null;
};

const setDraftNewArticle = (data: DraftArticle): void => {
  localStorage.setItem(DRAFT_NEW_ARTICLE_KEY, JSON.stringify(data));
};

const removeDraftNewArticle = (): void => {
  localStorage.removeItem(DRAFT_NEW_ARTICLE_KEY);
};

const getDraftEditArticle = (slug: string): DraftArticle | null => {
  const draft = localStorage.getItem(`${DRAFT_EDIT_ARTICLE_PREFIX}${slug}`);
  return draft ? JSON.parse(draft) : null;
};

const setDraftEditArticle = (slug: string, data: DraftArticle): void => {
  localStorage.setItem(`${DRAFT_EDIT_ARTICLE_PREFIX}${slug}`, JSON.stringify(data));
};

const removeDraftEditArticle = (slug: string): void => {
  localStorage.removeItem(`${DRAFT_EDIT_ARTICLE_PREFIX}${slug}`);
};

export {
  DRAFT_NEW_ARTICLE_KEY,
  DRAFT_EDIT_ARTICLE_PREFIX,
  getDraftNewArticle,
  setDraftNewArticle,
  removeDraftNewArticle,
  getDraftEditArticle,
  setDraftEditArticle,
  removeDraftEditArticle,
};