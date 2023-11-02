import { objectEntries } from "./utils";

export abstract class ParentManager<T> {
  abstract getParents(
    value: T | string
  ): Promise<Array<string> | undefined> | Array<string> | undefined;
  abstract getRecursiveParentsOf(
    value: T | string
  ): Promise<string[]> | string[];
}

export abstract class BaseParentManager<T> extends ParentManager<T> {
  abstract getParents(
    value: T | string
  ): Promise<Array<string> | undefined> | Array<string> | undefined;
  protected abstract getId(value: T | string): string;
  async getRecursiveParentsOf(
    value: T | string,
    cache = new Set<string>()
  ): Promise<string[]> {
    const id = this.getId(value);

    if (cache.has(id)) return [];

    cache.add(id);

    const parents = (await this.getParents(id)) ?? [];

    return [
      id,
      ...(
        await Promise.all(
          parents.map((p) => this.getRecursiveParentsOf(p, cache))
        )
      ).flat(),
    ];
  }
}

export abstract class StaticParentManager<T> extends BaseParentManager<T> {
  protected parents = new Map<string, Array<string>>();

  protected abstract getId(value: T | string): string;

  addParents(role: T | string, parents: (T | string)[]): void {
    const id = this.getId(role);

    if (!this.parents.has(id)) {
      this.parents.set(id, []);
    }

    for (const parent of parents) {
      const parentId = this.getId(parent);
      const c = this.parents.get(id)!;

      if (!c.includes(parentId)) {
        c.push(parentId);
      }
    }
  }

  setParents(role: T | string, parents: (T | string)[]): void {
    const id = this.getId(role);

    this.parents.delete(id);

    this.addParents(role, parents);
  }

  getParents(role: T | string): Array<string> | undefined {
    const id = this.getId(role);

    return this.parents.get(id);
  }

  export(): Record<string, string[]> {
    const data: Record<string, string[]> = {};

    for (const [role, parents] of this.parents) {
      data[role] = parents;
    }

    return data;
  }

  import(data: Record<string, string[]>): void {
    for (const [role, parents] of objectEntries(data)) {
      this.setParents(role, parents);
    }
  }
}
