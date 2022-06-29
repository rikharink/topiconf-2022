import { Entity } from './entity';

export class EntityStore {
  private _entities: Map<string, Entity> = new Map<string, Entity>();

  public register(...entities: Entity[]) {
    for (const e of entities) {
      if (!this._entities.has(e.id)) {
        this._entities.set(e.id, e);
      }
    }
  }

  public get(id: string): Entity | undefined {
    return this._entities.get(id);
  }
}
