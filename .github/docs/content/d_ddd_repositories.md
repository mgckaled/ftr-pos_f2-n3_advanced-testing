# Testes para Repository (DDD)

## Introdução

Repositories são responsáveis pela persistência e recuperação de agregados, abstraindo a camada de dados e fornecendo uma interface orientada a coleções. Os testes de Repository devem validar a correta persistência e recuperação de dados, garantir que as queries retornam os resultados esperados, e verificar o comportamento em casos de erro. A estratégia principal envolve testes de integração com banco de dados real ou em memória, além de testes unitários com mocks para validar a lógica de mapeamento.

## Estratégias de Teste

Para Repositories, deve-se utilizar testes de integração para verificar a comunicação real com o banco de dados, testes unitários com mocks para validar a lógica sem dependências externas, e testes que garantam que os objetos de domínio são corretamente mapeados para a camada de persistência e vice-versa. É importante testar cenários de erro como falhas de conexão e constraints violadas.

## Exemplo Prático: Repository de Usuário

```typescript
// src/domain/repositories/IUserRepository.ts
export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  delete(id: string): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
}

// src/infrastructure/repositories/UserRepository.ts
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

export class UserRepository implements IUserRepository {
  constructor(private database: Database) {}

  async save(user: User): Promise<void> {
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email.value,
      createdAt: user.createdAt
    };

    const existing = await this.findById(user.id);
    
    if (existing) {
      await this.database.query(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [userData.name, userData.email, userData.id]
      );
    } else {
      await this.database.query(
        'INSERT INTO users (id, name, email, created_at) VALUES (?, ?, ?, ?)',
        [userData.id, userData.name, userData.email, userData.createdAt]
      );
    }
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.database.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (!result || result.length === 0) {
      return null;
    }

    return this.mapToEntity(result[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.database.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!result || result.length === 0) {
      return null;
    }

    return this.mapToEntity(result[0]);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const result = await this.database.query(
      'SELECT COUNT(*) as count FROM users WHERE email = ?',
      [email]
    );

    return result[0].count > 0;
  }

  private mapToEntity(data: any): User {
    return new User(
      data.id,
      data.name,
      new Email(data.email),
      new Date(data.created_at)
    );
  }
}
```

## Testes de Integração

```typescript
// tests/integration/infrastructure/repositories/UserRepository.spec.ts
import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { UserRepository } from '../../../../src/infrastructure/repositories/UserRepository';
import { User } from '../../../../src/domain/entities/User';
import { Email } from '../../../../src/domain/value-objects/Email';
import { TestDatabase } from '../../../helpers/TestDatabase';

describe('UserRepository - Integration Tests', () => {
  let database: TestDatabase;
  let repository: UserRepository;

  beforeEach(async () => {
    database = new TestDatabase();
    await database.connect();
    await database.migrate();
    repository = new UserRepository(database);
  });

  afterEach(async () => {
    await database.clean();
    await database.disconnect();
  });

  describe('Save Operations', () => {
    it('should persist new user to database', async () => {
      const user = new User(
        'user-123',
        'John Doe',
        new Email('john@example.com')
      );

      await repository.save(user);

      const found = await repository.findById('user-123');
      expect(found).to.not.be.null;
      expect(found?.name).to.equal('John Doe');
      expect(found?.email.value).to.equal('john@example.com');
    });

    it('should update existing user', async () => {
      const user = new User(
        'user-123',
        'John Doe',
        new Email('john@example.com')
      );

      await repository.save(user);

      user.updateName('John Updated');
      await repository.save(user);

      const found = await repository.findById('user-123');
      expect(found?.name).to.equal('John Updated');
    });
  });

  describe('Find Operations', () => {
    it('should find user by email', async () => {
      const user = new User(
        'user-123',
        'Jane Doe',
        new Email('jane@example.com')
      );

      await repository.save(user);

      const found = await repository.findByEmail('jane@example.com');
      expect(found).to.not.be.null;
      expect(found?.email.value).to.equal('jane@example.com');
    });

    it('should check if email exists', async () => {
      const user = new User(
        'user-123',
        'Jane Doe',
        new Email('jane@example.com')
      );

      await repository.save(user);

      const exists = await repository.existsByEmail('jane@example.com');
      expect(exists).to.be.true;

      const notExists = await repository.existsByEmail('other@example.com');
      expect(notExists).to.be.false;
    });
  });

  describe('Delete Operations', () => {
    it('should delete user from database', async () => {
      const user = new User(
        'user-123',
        'John Doe',
        new Email('john@example.com')
      );

      await repository.save(user);
      await repository.delete('user-123');

      const found = await repository.findById('user-123');
      expect(found).to.be.null;
    });
  });
});
```

## Testes Unitários com Mocks

```typescript
// tests/unit/infrastructure/repositories/UserRepository.spec.ts
import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';
import { UserRepository } from '../../../../src/infrastructure/repositories/UserRepository';
import { User } from '../../../../src/domain/entities/User';
import { Email } from '../../../../src/domain/value-objects/Email';

describe('UserRepository - Unit Tests with Mocks', () => {
  
  describe('Mapping Logic', () => {
    it('should correctly map database result to entity', async () => {
      const mockDatabase = {
        query: sinon.stub().resolves([{
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          created_at: new Date('2025-01-01')
        }])
      };

      const repository = new UserRepository(mockDatabase as any);
      const user = await repository.findById('user-123');

      expect(user).to.not.be.null;
      expect(user?.name).to.equal('John Doe');
      expect(mockDatabase.query.calledOnce).to.be.true;
    });

    it('should handle database errors gracefully', async () => {
      const mockDatabase = {
        query: sinon.stub().rejects(new Error('Connection failed'))
      };

      const repository = new UserRepository(mockDatabase as any);

      try {
        await repository.findById('user-123');
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).to.equal('Connection failed');
      }
    });

     it('should return null when user not found by id', async () => {
      const found = await repository.findById('non-existent');
      expect(found).to.be.null;
    });

    it('should find user byid', async () => {
      const user = new User(
        'user-123',
        'Jane Doe',
        new Email('jane@example.com')
      );

      await repository.save(user);

      const found = await repository.findById('user-123');
      expect(found).to.not.be.null;
      expect(found?.id).to.equal('user-123');
    });
  });
});
```

## Pontos-chave

Repositories devem ser testados tanto em integração com banco de dados real quanto com mocks para validar a lógica isoladamente. Os testes de integração garantem que a persistência funciona corretamente, enquanto testes unitários verificam o mapeamento e tratamento de erros. É fundamental testar cenários de erro e garantir que o repository mantém a integridade dos dados do domínio.
