export interface Category {
  categoryId: number;
  categoryName: string;
  parentCategoryId: number | null;
  slug: string;
  opportunityCount: number;
  description?: string;
  icon?: string;
}
