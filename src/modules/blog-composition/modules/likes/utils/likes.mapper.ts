import { LikeMongoEntity } from '../repository/mongoose/schemas/like.schema';
import { LikeEntity } from '../entities/like.entity';
import { DbLike } from '../repository/postgresql/types/like';

export class LikesMapper {
  public static toMongo(likeEntity: LikeEntity): LikeMongoEntity {
    return new LikeMongoEntity(
      likeEntity.id,
      likeEntity.userId,
      likeEntity.userLogin,
      likeEntity.locationId,
      likeEntity.locationName,
      likeEntity.myStatus,
      likeEntity.isBanned,
      likeEntity.createdAt,
    );
  }

  public static toDomainFromMongo(likeMongoEntity: LikeMongoEntity): LikeEntity {
    return new LikeEntity(
      likeMongoEntity.id,
      likeMongoEntity.userId,
      likeMongoEntity.userLogin,
      likeMongoEntity.locationId,
      likeMongoEntity.locationName,
      likeMongoEntity.myStatus,
      likeMongoEntity.isBanned,
      likeMongoEntity.createdAt,
    );
  }

  public static toDomainFromPlainSql(dbLike: DbLike, locationName): LikeEntity {
    return new LikeEntity(
      dbLike.id,
      dbLike.userId,
      dbLike.userLogin,
      dbLike.locationId,
      locationName,
      dbLike.status,
      false,
      dbLike.createdAt,
    );
  }
}
