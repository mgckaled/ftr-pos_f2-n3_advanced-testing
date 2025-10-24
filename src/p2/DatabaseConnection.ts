interface DatabaseConfig {
  host: string
  port: number
  database: string
}

export class DatabaseConnection {
  private static instance: DatabaseConnection | null = null
  private config: DatabaseConfig
  public isConnected = false

  private constructor(config: DatabaseConfig) {
    this.config = config
  }

  async connect(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true
        resolve()
      }, 100)
    })
  }

  static getInstance(config: DatabaseConfig): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection(config)
    }
    return DatabaseConnection.instance
  }

  static clearInstance(): void {
    DatabaseConnection.instance = null
  }

  getConfig(): DatabaseConfig {
    return this.config
  }
}
