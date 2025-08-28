export interface Book {
  id: number;
  title: string;
  author: string;
  published_year?: number;
  available: number;
  created_at: string;
}

export interface BookInput {
  title: string;
  author: string;
  published_year?: number;
}

export interface BookSearchResult {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
}

export interface OpenLibraryResponse {
  docs: BookSearchResult[];
  numFound: number;
  start: number;
}

export interface BorrowRecord {
  id: number;
  user_id: number;
  book_id: number;
  borrowed_at: string;
  returned_at?: string;
  due_date: string;
}

export interface BorrowedBook extends Book {
  borrowed_at: string;
  due_date: string;
  returned_at?: string;
}
