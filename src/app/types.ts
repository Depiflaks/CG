export type UnmountTask = () => void;
export type MountTask = (container: HTMLElement) => UnmountTask | undefined;

export interface TaskDefinition {
  readonly id: string;
  readonly name: string;
  readonly mount: MountTask;
}

export interface LabDefinition {
  readonly id: string;
  readonly name: string;
  readonly tasks: readonly TaskDefinition[];
}
