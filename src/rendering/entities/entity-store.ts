import { Entity } from './entity';

export class EntityStore {
  private _entities: Map<string, Entity> = new Map<string, Entity>();

  public register(entity: Entity) {
    if (!this._entities.has(entity.id)) {
      this._entities.set(entity.id, entity);
    }
  }

  public get(id: string): Entity | undefined {
    return this._entities.get(id);
  }
}
