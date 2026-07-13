import { test } from '@playwright/test';

type AsyncMethod<This, Args extends unknown[], Result> = (
  this: This,
  ...args: Args
) => Promise<Result>;

export function step<This extends object, Args extends unknown[], Result>(title?: string) {
  return function decorate(
    target: AsyncMethod<This, Args, Result>,
    context: ClassMethodDecoratorContext<This, AsyncMethod<This, Args, Result>>,
  ): AsyncMethod<This, Args, Result> {
    return function replacement(this: This, ...args: Args): Promise<Result> {
      const name = title ?? `${this.constructor.name}.${String(context.name)}`;
      return test.step(name, () => target.call(this, ...args));
    };
  };
}
