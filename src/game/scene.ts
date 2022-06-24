export class Scene {
  public previous?: Scene;
  public next?: Scene;
  public text: string;

  public constructor(text: string, previous?: Scene, next?: Scene) {
    this.text = text;
    this.previous = previous;
    this.next = next;
  }

  public addNext(text: string): Scene {
    var child = new Scene(text.toUpperCase(), this);
    this.next = child;
    return child;
  }
}
