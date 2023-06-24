export type Option = string;

export interface Scenario {
  description: string,
  options: Option[],
  chosenOption?: Option
}
