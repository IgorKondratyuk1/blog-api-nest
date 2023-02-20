import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentsQueryRepository } from './comments.query-repository';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsQueryRepository: CommentsQueryRepository) {}

  // @Post()
  // create(@Body() createCommentDto: CreateCommentDto) {
  //   return this.commentsService.create(createCommentDto);
  // }

  // @Get()
  // findAll() {
  //   return this.commentsService.findAll();
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsQueryRepository.findOne(id);
  }

  // @Put(':id')
  // update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
  //   return this.commentsService.update(id, updateCommentDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.commentsService.remove(id);
  // }
}
