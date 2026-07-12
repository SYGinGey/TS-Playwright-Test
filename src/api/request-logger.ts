import { test } from '@playwright/test';
import type { APIRequestContext, APIResponse } from '@playwright/test';

const HTTP_METHODS = ['delete', 'get', 'patch', 'post', 'put'] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];
type RequestOptions = Parameters<APIRequestContext['post']>[1];

const MAX_BODY_SIZE = 20_000;

export function withRequestLogging(context: APIRequestContext): APIRequestContext {
  return new Proxy(context, {
    get(target, property, receiver) {
      if (!isHttpMethod(property)) {
        const value: unknown = Reflect.get(target, property, receiver);
        return typeof value === 'function' ? (value.bind(target) as unknown) : value;
      }

      const send: (url: string, options?: RequestOptions) => Promise<APIResponse> =
        target[property].bind(target);

      return (url: string, options?: RequestOptions) => {
        if (!insideTest()) return send(url, options);

        const title = `${property.toUpperCase()} ${pathOf(url)}${queryOf(options)}`;
        return test.step(title, async () => {
          const response = await send(url, options);
          await attachExchange(options, response);
          return response;
        });
      };
    },
  });
}

async function attachExchange(options: RequestOptions, response: APIResponse): Promise<void> {
  const info = test.info();
  const status = `${response.status()} ${response.statusText()}`;

  if (options?.data !== undefined) {
    await info.attach('request body', {
      body: pretty(options.data),
      contentType: 'application/json',
    });
  }

  const headers = Object.entries(response.headers())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => `${name}: ${value}`)
    .join('\n');
  await info.attach(`response headers (${status})`, { body: headers, contentType: 'text/plain' });

  const body = await response.text().catch(() => '');
  if (body) {
    const json = prettyJson(body);
    await info.attach(`response body (${status})`, {
      body: truncate(json ?? body),
      contentType: json ? 'application/json' : 'text/plain',
    });
  }
}

function isHttpMethod(property: string | symbol): property is HttpMethod {
  return typeof property === 'string' && (HTTP_METHODS as readonly string[]).includes(property);
}

function insideTest(): boolean {
  try {
    test.info();
    return true;
  } catch {
    return false;
  }
}

function pretty(data: unknown): string {
  return typeof data === 'string' ? data : JSON.stringify(data, null, 2);
}

function prettyJson(text: string): string | undefined {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return undefined;
  }
}

function truncate(text: string): string {
  return text.length > MAX_BODY_SIZE
    ? `${text.slice(0, MAX_BODY_SIZE)}\n... truncated (${text.length} chars total)`
    : text;
}

function pathOf(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url; // relative URL — already a path
  }
}

function queryOf(options: RequestOptions): string {
  if (!options?.params) return '';
  const pairs = Object.entries(options.params).map(([key, value]) => `${key}=${String(value)}`);
  return `?${pairs.join('&')}`;
}
