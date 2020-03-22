import {Count, CountSchema, Filter, FilterExcludingWhere, repository, Where} from '@loopback/repository';
import {del, get, getModelSchemaRef, HttpErrors, param, patch, post, put, requestBody} from '@loopback/rest';
import {User} from '../models';
import {UserRepository} from '../repositories';
const PasswordHasher = require('password-hasher');

interface HashedPassword {
  hashpass: string,
  salt: string,
}

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  hashMethod = 'ssha512';

  @post('/users', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                accessKey: {type: 'string'},
                profile: getModelSchemaRef(User, {
                  exclude: ['salt', 'password']
                })
              }
            }
          }
        },
      },
    },
  })
  create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: ['id', 'salt', 'created', 'modified', 'emailVerified'],
          }),
        },
      },
    })
    user: Omit<User, 'id'>,
  ): Promise<User> {
    return new Promise((resolve, reject) => {
      // email password
      if (user.email.trim().length === 0 || user.password.trim().length === 0) {
        throw new HttpErrors.UnprocessableEntity('Email and password is required params')
      }

      this.userRepository.findOne({
        where: {
          email: {regexp: new RegExp(user.email, 'i')}
        }
      }).then((userInst: User | null) => {
        if (userInst !== null) {
          reject(new HttpErrors.UnprocessableEntity('User with given email exists'))
          return
        }

        const passwordObj: HashedPassword = this.generateHashedPassword(user.password);

        const userPayload: object = {
          email: user.email,
          password: passwordObj.hashpass,
          salt: passwordObj.salt,

        }

        this.userRepository.create(userPayload)
          .then(resolve)
          .catch(reject)

      }).catch(reject)
    })
  }

  @get('/users/count', {
    responses: {
      '200': {
        description: 'User model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(User) where?: Where<User>,
  ): Promise<Count> {
    return this.userRepository.count(where);
  }

  @get('/users', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(User, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(User) filter?: Filter<User>,
  ): Promise<User[]> {
    return this.userRepository.find(filter);
  }

  @patch('/users', {
    responses: {
      '200': {
        description: 'User PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
    @param.where(User) where?: Where<User>,
  ): Promise<Count> {
    return this.userRepository.updateAll(user, where);
  }

  @get('/users/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>
  ): Promise<User> {
    return this.userRepository.findById(id, filter);
  }

  @patch('/users/{id}', {
    responses: {
      '204': {
        description: 'User PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  @put('/users/{id}', {
    responses: {
      '204': {
        description: 'User PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() user: User,
  ): Promise<void> {
    await this.userRepository.replaceById(id, user);
  }

  @del('/users/{id}', {
    responses: {
      '204': {
        description: 'User DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.userRepository.deleteById(id);
  }

  generateHashedPassword(password: string): HashedPassword {
    const out = PasswordHasher.createHashAndSalt(this.hashMethod, password, 32)
    const salt = out.salt.toString('base64')
    const hash = out.hash.toString('base64')
    return {hashpass: hash, salt: salt}
  }
}
