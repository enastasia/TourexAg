export class Phone {
  private static readonly PATTERN = /^\+\d{10,15}$/;

  private readonly value: string;

  public constructor(raw: string) {
    this.value = raw.trim();
  }

  public getValue(): string {
    return this.value;
  }

  public isValid(): boolean {
    return Phone.isValid(this.value);
  }

  public equals(other: Phone): boolean {
    return this.normalize() === other.normalize();
  }

  public toString(): string {
    return this.value;
  }

  private normalize(): string {
    return this.value.replace(/[\s\-().]/g, '');
  }

  public static isValid(raw: string): boolean {
    const digits = raw.replace(/[\s\-().]/g, '');
    return Phone.PATTERN.test(digits);
  }
}
