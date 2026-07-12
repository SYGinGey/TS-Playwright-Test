export interface GistFile {
  filename: string;
  type: string;
  language: string | null;
  raw_url: string;
  size: number;
  truncated?: boolean;
  content?: string;
}

export interface GistOwner {
  login: string;
  id: number;
  html_url: string;
}

export interface GistHistoryEntry {
  version: string;
  committed_at: string;
  user: GistOwner | null;
  change_status: {
    total: number;
    additions: number;
    deletions: number;
  };
}

export interface Gist {
  id: string;
  url: string;
  html_url: string;
  description: string | null;
  public: boolean;
  created_at: string;
  updated_at: string;
  files: Record<string, GistFile>;
  owner?: GistOwner;
  history?: GistHistoryEntry[];
  fork_of?: Gist;
}

export interface CreateGistPayload {
  description?: string;
  public?: boolean;
  files: Record<string, { content: string }>;
}

export interface UpdateGistPayload {
  description?: string;
  files?: Record<string, { content?: string; filename?: string } | null>;
}

export interface ListGistsParams {
  per_page?: number;
  page?: number;
  since?: string;
}
