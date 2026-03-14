export const GatewayStatusEnum = {
  ACTIVE: true,
  INACTIVE: false,
} as const

export type GatewayStatusEnum = (typeof GatewayStatusEnum)[keyof typeof GatewayStatusEnum]
