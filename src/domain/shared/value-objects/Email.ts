export class Email {
  private static readonly PATTERN = /^[a-zA-Z0-9._%+]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  private readonly value: string;

  public constructor(raw: string) {
    this.value = raw.trim().toLowerCase();
  }

  public getValue(): string {
    return this.value;
  }

  public isValid(): boolean {
    return Email.isValid(this.value);
  }

  public equals(other: Email): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public static isValid(raw: string): boolean {
    return Email.PATTERN.test(raw.trim());
  }
}
