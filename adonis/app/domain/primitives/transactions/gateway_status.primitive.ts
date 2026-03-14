export class GatewayStatus {
  private constructor(public readonly value: boolean) {}

  public static create(value: boolean): GatewayStatus {
    return new GatewayStatus(value)
  }

  public static active(): GatewayStatus {
    return new GatewayStatus(true)
  }

  public static inactive(): GatewayStatus {
    return new GatewayStatus(false)
  }

  public isActive(): boolean {
    return this.value
  }

  public isInactive(): boolean {
    return !this.value
  }
}
