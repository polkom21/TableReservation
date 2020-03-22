import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    hiddenProperties: ['password', 'salt']
  }
})
export class User extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
    required: true,
  })
  salt: string;

  @property({
    type: 'boolean',
    default: false,
  })
  emailVerified?: boolean;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  created?: Date;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  modified?: Date;


  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
