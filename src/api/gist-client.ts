import type { APIRequestContext, APIResponse } from '@playwright/test';
import type {CreateGistPayload, GistCommentPayload, ListGistsParams, UpdateGistPayload} from '../types/gist';

export class GistClient {
  constructor(private readonly request: APIRequestContext) {}

  createGist(payload: CreateGistPayload): Promise<APIResponse> {
    return this.request.post('/gists', { data: payload });
  }

  createGistRaw(payload: unknown): Promise<APIResponse> {
    return this.request.post('/gists', { data: payload });
  }

  getGist(gistId: string): Promise<APIResponse> {
    return this.request.get(`/gists/${gistId}`);
  }

  updateGist(gistId: string, payload: UpdateGistPayload): Promise<APIResponse> {
    return this.request.patch(`/gists/${gistId}`, { data: payload });
  }

  deleteGist(gistId: string): Promise<APIResponse> {
    return this.request.delete(`/gists/${gistId}`);
  }

  /** Gists of the authenticated user. */
  listGists(params: ListGistsParams = {}): Promise<APIResponse> {
    return this.request.get('/gists', { params: { ...params } });
  }

  listPublicGists(params: ListGistsParams = {}): Promise<APIResponse> {
    return this.request.get('/gists/public', { params: { ...params } });
  }

  listStarredGists(params: ListGistsParams = {}): Promise<APIResponse> {
    return this.request.get('/gists/starred', { params: { ...params } });
  }

  listCommits(gistId: string): Promise<APIResponse> {
    return this.request.get(`/gists/${gistId}/commits`);
  }

  getRevision(gistId: string, sha: string): Promise<APIResponse> {
    return this.request.get(`/gists/${gistId}/${sha}`);
  }

  starGist(gistId: string): Promise<APIResponse> {
    return this.request.put(`/gists/${gistId}/star`);
  }

  unstarGist(gistId: string): Promise<APIResponse> {
    return this.request.delete(`/gists/${gistId}/star`);
  }

  /** 204 when starred, 404 when not. */
  checkGistStarred(gistId: string): Promise<APIResponse> {
    return this.request.get(`/gists/${gistId}/star`);
  }

  forkGist(gistId: string): Promise<APIResponse> {
    return this.request.post(`/gists/${gistId}/forks`);
  }

  createGistComment(gistId: string, payload: GistCommentPayload): Promise<APIResponse> {
    return this.request.post(`/gists/${gistId}/comments`, { data: payload });
  }

  getGistComment(gistId: string, commentId: number): Promise<APIResponse> {
    return this.request.get(`/gists/${gistId}/comments/${commentId}`);
  }

  updateGistComment(gistId: string, commentId: number, payload: GistCommentPayload): Promise<APIResponse> {
    return this.request.patch(`/gists/${gistId}/comments/${commentId}`, { data: payload });
  }

  deleteGistComment(gistId: string, commentId: number): Promise<APIResponse> {
    return this.request.delete(`/gists/${gistId}/comments/${commentId}`);
  }

  /** For absolute URLs returned by the API, e.g. files[*].raw_url. */
  getAbsoluteUrl(url: string): Promise<APIResponse> {
    return this.request.get(url);
  }
}
