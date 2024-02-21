import { ExtendedLikesInfo } from '../../../likes/dto/extended-likes-info.dto';

export class ViewPostDto {
  constructor(
    public id: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: string,
    public extendedLikesInfo: ExtendedLikesInfo = new ExtendedLikesInfo(),
  ) {}
}
