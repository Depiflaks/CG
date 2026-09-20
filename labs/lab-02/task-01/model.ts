export type ElementType = string;

export interface TypeDefinition {
  name: ElementType;
  img: string;
  sound: string;
  isBase: boolean;
}

class ElementNotFoundException extends Error {
  constructor(id: string) {
    super(`Element with id ${id} not found`);
    this.name = "ElementNotFoundException";
  }
}

class TypeNotOpenedException extends Error {
  constructor(type: ElementType) {
    super(`Type ${type} is not opened in the library`);
    this.name = "TypeNotOpenedException";
  }
}

interface Schema {
  ingridients: ElementType[];
  result: ElementType;
}

export interface LibraryData {
  types: TypeDefinition[];
  schemas: Schema[];
}

export class Element {
  private id: string;
  private type: ElementType;

  constructor(id: string, type: ElementType) {
    this.id = id;
    this.type = type;
  }

  public getId(): string {
    return this.id;
  }

  public getType(): ElementType {
    return this.type;
  }
}

export interface BoardObserver {
  updateElements(): void;
}

export class Library {
  private elements: Map<ElementType, boolean>;
  private typeDefinitions: Map<ElementType, TypeDefinition>;
  private schemas: Schema[];

  constructor(data: LibraryData) {
    this.elements = new Map<ElementType, boolean>();
    this.typeDefinitions = new Map<ElementType, TypeDefinition>();

    for (const typeDef of data.types) {
      this.elements.set(typeDef.name, typeDef.isBase);
      this.typeDefinitions.set(typeDef.name, typeDef);
    }

    this.schemas = data.schemas;
  }

  public isOpen(type: ElementType): boolean {
    return this.elements.get(type) === true;
  }

  public tryCombine(types: ElementType[]): ElementType | null {
    const sortedInput = [...types].sort();

    for (const schema of this.schemas) {
      const ing = schema.ingridients;

      if (ing.length === sortedInput.length) {
        const sortedSchema = [...ing].sort();
        const isMatch = sortedInput.every(
          (val, index) => val === sortedSchema[index],
        );

        if (isMatch) {
          this.elements.set(schema.result, true);
          return schema.result;
        }
      }
    }
    return null;
  }

  public openedTypes(): TypeDefinition[] {
    const opened: TypeDefinition[] = [];
    for (const [type, isOpen] of this.elements.entries()) {
      if (isOpen) {
        const typeDef = this.typeDefinitions.get(type);
        if (typeDef) {
          opened.push(typeDef);
        }
      }
    }
    return opened;
  }
}

export class Board {
  private elementsMap: Map<string, Element>;
  private library: Library;
  private observers: BoardObserver[];
  private nextIdCounter: number;

  constructor(library: Library) {
    this.library = library;
    this.elementsMap = new Map<string, Element>();
    this.observers = [];
    this.nextIdCounter = 1;
  }

  public addObserver(observer: BoardObserver): void {
    this.observers.push(observer);
  }

  public remove(id: string): void {
    if (!this.elementsMap.has(id)) {
      throw new ElementNotFoundException(id);
    }
    this.elementsMap.delete(id);
    this.notifyObservers();
  }

  public append(type: ElementType): Element {
    if (!this.library.isOpen(type)) {
      throw new TypeNotOpenedException(type);
    }

    const id = this.nextIdCounter.toString();
    this.nextIdCounter++;

    const element = new Element(id, type);
    this.elementsMap.set(id, element);
    this.notifyObservers();

    return element;
  }

  public tryCombine(ids: string[]): Element | null {
    const combineTypes: ElementType[] = [];

    for (const id of ids) {
      const element = this.elementsMap.get(id);
      if (!element) {
        throw new ElementNotFoundException(id);
      }
      combineTypes.push(element.getType());
    }

    const resultType = this.library.tryCombine(combineTypes);

    if (resultType) {
      for (const id of ids) {
        this.remove(id);
      }
      return this.append(resultType);
    }

    return null;
  }

  public elements(): Element[] {
    return Array.from(this.elementsMap.values());
  }

  private notifyObservers(): void {
    for (const observer of this.observers) {
      observer.updateElements();
    }
  }
}
