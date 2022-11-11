import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CreateUserRequest } from './dto/create-user.request';
import { UserCreatedEvent } from './events/user-created.event';

@Injectable()
export class AppService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly schedulerRegistry: SchedulerRegistry
  ) { }
  private readonly logger = new Logger(AppService.name);
  getHello(): string {
    return 'Hello World! Here we go👋';
  }

  async createUser(body: CreateUserRequest) {
    this.logger.log('creating user...', body)
    const userId = '123'
    this.eventEmitter.emit(
      'user.created',
      new UserCreatedEvent(userId, body.email),
    )
    const establishWebSocketTimeout = setTimeout(() => this.establishWebSocketConnection(userId), 5000);
    this.schedulerRegistry.addTimeout(`${userId}_establish_ws`, establishWebSocketTimeout)
  }

  private establishWebSocketConnection(userId: string) {
    this.logger.log('Establishing websocket connection...', userId)
  }

  @OnEvent('user.created')
  welcomeNewUser(payload: UserCreatedEvent) {
    this.logger.log('Welcome new user ...', payload.email)
  }

  @OnEvent('user.created', { async: true })
  async sendWelcomeGift(payload: UserCreatedEvent) {
    this.logger.log('This is you welcome gift ...', payload.email)
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 3000))
    this.logger.log('Welcome gift sent', payload.email)
  }

  @Cron(CronExpression.EVERY_10_SECONDS, { name: 'delete_expired_user' })
  deleteExpiredUsers() {
    this.logger.log('Deleting expired users...')
  }

}
