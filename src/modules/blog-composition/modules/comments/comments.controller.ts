import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Put,
  NotFoundException,
  InternalServerErrorException,
  UseGuards,
  HttpCode,
  HttpException,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentsQueryRepository } from './comments.query-repository';
import { JwtAccessStrictAuthGuard } from '../../../auth/guards/jwt-access-strict-auth.guard';
import { CurrentTokenPayload } from '../../../auth/decorators/current-token-payload.param.decorator';
import { AuthTokenPayloadDto } from '../../../auth/dto/auth-token-payload.dto';
import { UpdateLikeDto } from '../likes/dto/update-like.dto';
import { CustomErrorDto } from '../../../../common/dto/error';
import { JwtAccessSoftAuthGuard } from '../../../auth/guards/jwt-access-soft-auth.guard';
import { CurrentUserId } from '../../../auth/decorators/current-user-id.param.decorator';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('comments')
export class CommentsController {
  constructor(private commentsQueryRepository: CommentsQueryRepository, private commentsService: CommentsService) {}

  @UseGuards(JwtAccessSoftAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUserId() userId: string) {
    const result = await this.commentsQueryRepository.findById(id, userId);

    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(JwtAccessStrictAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async update(
    @Param('id') id: string,
    @CurrentTokenPayload() tokenPayload: AuthTokenPayloadDto,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    const result: boolean | CustomErrorDto = await this.commentsService.update(
      id,
      tokenPayload.userId,
      updateCommentDto,
    );
    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    if (!result) throw new InternalServerErrorException('can not update comment');

    return;
  }

  @UseGuards(JwtAccessStrictAuthGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async updateLikeStatus(
    @Param('id') id: string,
    @CurrentTokenPayload() tokenPayload: AuthTokenPayloadDto,
    @Body() updateLikeDto: UpdateLikeDto,
  ) {
    console.log(tokenPayload);
    const result: boolean | CustomErrorDto = await this.commentsService.updateLikeStatus(
      id,
      tokenPayload.userId,
      tokenPayload.userLogin,
      updateLikeDto.likeStatus,
    );
    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    if (!result) throw new InternalServerErrorException('can not update comment');
    return;
  }

  @UseGuards(JwtAccessStrictAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @CurrentTokenPayload() tokenPayload: AuthTokenPayloadDto) {
    const result: boolean | CustomErrorDto = await this.commentsService.remove(id, tokenPayload.userId);
    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    if (!result) throw new InternalServerErrorException('can not delete comment');
    return;
  }
}
