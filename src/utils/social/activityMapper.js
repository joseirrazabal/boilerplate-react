export default (activity) => {
  const activityType = `${activity.type}_${activity.entity.type}`;
  //TODO: REFACTORIZAR LOS ELEMENTOS REPETIDOS DE SERIES Y PELICULAS
  switch(activityType) {
  case "register_user":
    return {
      isFirst: (activity.unique && activity.unique.first !== undefined) ? activity.unique.first : true,
      activity_type: activity.type,
      entity_type: activity.entity.type,
      score: (activity.score) ? activity.score.value : 0,
    };
  case "facebook_user":
    return {
      isFirst: (activity.unique && activity.unique.first !== undefined) ? activity.unique.first : true,
      activity_type: activity.type,
      entity_type: activity.entity.type,
      facebookId: activity.entity.metadatas.facebookId || "",
      score: (activity.score) ? activity.score.value : 0,
    };
  case "monthlySubscription_subscription":
    return {
        isFirst: (activity.unique && activity.unique.first !== undefined) ? activity.unique.first : true,
        activity_type: activity.type,
        entity_type: activity.entity.type,
        entity_offerId: activity.entity.metadatas.offer_id,
        score: (activity.score) ? activity.score.value : 0,
    };
  case "weeklySubscription_subscription":
    return {
      isFirst: (activity.unique && activity.unique.first !== undefined) ? activity.unique.first : true,
      activity_type: activity.type,
      entity_type: activity.entity.type,
      entity_offerId: activity.entity.metadatas.offer_id || undefined,
      score: (activity.score) ? activity.score.value : 0,
    };
  case "watchTrailer_tvShow":
  case "watchTrailer_freeTvShow":
  case "watchTrailer_suscTvShow":
    const serie_trailer = (activity.entity.metadatas.serie) ? activity.entity.metadatas.serie : {};
    const image_small_serie_trailer = serie_trailer.image_small || "";
    const image_large_serie_trailer = serie_trailer.image_large || "";
    const image_medium_serie_trailer = serie_trailer.image_medium || "";
    const title_serie_trailer = serie_trailer.title || "";
    return {
      isFirst: (activity.unique && activity.unique.first !== undefined) ? activity.unique.first : true,
      activity_type: activity.type,
      entity_type: activity.entity.type,
      score: (activity.score) ? activity.score.value : 0,
      group_id: activity.entity.metadatas.group_id,
      title: activity.entity.metadatas.title,
      serie_title: title_serie_trailer,
      image_small: image_small_serie_trailer,
      image_large: image_large_serie_trailer,
      image_medium: image_medium_serie_trailer,
    };
  case "favorite_suscAmcoMovie":
  case "favorite_freeAmcoMovie":
  case "favorite_freeMovie":
  case "favorite_suscMovie":
  case "favorite_movie":
    return {
      isFirst: (activity.unique && activity.unique.first !== undefined) ? activity.unique.first : true,
      activity_type: activity.type,
      entity_type: activity.entity.type,
      score: (activity.score) ? activity.score.value : 0,
      group_id: activity.entity.metadatas.group_id,
      title: activity.entity.metadatas.title,
      image_small: activity.entity.metadatas.image_small,
      image_background: activity.entity.metadatas.image_background,
      image_large: activity.entity.metadatas.image_large,
      image_medium: activity.entity.metadatas.image_medium,
    };
  case "favorite_tvShow":
  case "favorite_freeTvShow":
  case "favorite_suscTvShow":
    const serie_favorite = (activity.entity.metadatas.serie) ? activity.entity.metadatas.serie : {};
    const image_small_serie_favorite = serie_favorite.image_small || "";
    const image_large_serie_favorite = serie_favorite.image_large || "";
    const image_medium_serie_favorite = serie_favorite.image_medium || "";
    const title_serie_favorite = serie_favorite.title || "";
    return {
      isFirst: (activity.unique && activity.unique.first !== undefined) ? activity.unique.first : true,
      activity_type: activity.type,
      entity_type: activity.entity.type,
      score: (activity.score) ? activity.score.value : 0,
      group_id: activity.entity.metadatas.group_id,
      title: activity.entity.metadatas.title,
      serie_title: title_serie_favorite,
      image_small: image_small_serie_favorite,
      image_large: image_large_serie_favorite,
      image_medium: image_medium_serie_favorite,

    }
  case "beingFollow_user":
    return {
      id: activity.entity.id.$oid,
      userName: activity.entity.metadatas.name || "",
      imageUrl: activity.entity.metadatas.facebookId || activity.entity.metadatas.facebookID || "",
      isFirst: (activity.unique && activity.unique.first !== undefined) ? activity.unique.first : true,
      activity_type: activity.type,
      entity_type: activity.entity.type,
      score: (activity.score) ? activity.score.value : 0,
    };
  case "follow_user":
    return {
      isFirst: (activity.unique && activity.unique.first !== undefined) ? activity.unique.first : true,
      id: activity.entity.id.$oid,
      userName: activity.entity.metadatas.name || "",
      imageUrl: activity.entity.metadatas.facebookId || activity.entity.metadatas.facebookID || "",
      activity_type: activity.type,
      entity_type: activity.entity.type,
      score: (activity.score) ? activity.score.value : 0,
    };
  case "watchTrailer_movie": // este es el documentado pero todos regresan como suscAmcoMovie en lugar de movie
  case "watchTrailer_suscAmcoMovie":
  case "watchTrailer_suscMovie":
  case "watchTrailer_freeMovie":
  case "watchTrailer_freeAmcoMovie":
  case "view_live":
  case "view_livePPE":
  case "view_freeMovie":
  case "view_freeAmcoMovie":
  case "view_suscMovie":
  case "view_suscAmcoMovie":
  case "purchase_movie":
  case "rent48_movie":
  case "rent24_movie":
    return {
      isFirst: (activity.unique && activity.unique.first !== undefined) ? activity.unique.first : true,
      group_id: activity.entity.metadatas.group_id,
      title: activity.entity.metadatas.title,
      activity_type: activity.type,
      entity_type: activity.entity.type,
      image_small: activity.entity.metadatas.image_small,
      image_background: activity.entity.metadatas.image_background,
      image_large: activity.entity.metadatas.image_large,
      image_medium: activity.entity.metadatas.image_medium,
      score: (activity.score) ? activity.score.value : 0,
    };
  case "view_freeTvShow":
  case "view_suscTvShow":
  case "view_allseason":
  case "view_allserie":
  case "purchase_tvShow":
  case "rent48_tvShow":
  case "rent24_tvShow":
    const serie_view = (activity.entity.metadatas.serie) ? activity.entity.metadatas.serie : {};
    const { image_small = "", image_large = "", image_medium = "", title = "" } = serie_view;
    return {
      isFirst: (activity.unique && activity.unique.first !== undefined) ? activity.unique.first : true,
      activity_type: activity.type,
      entity_type: activity.entity.type,
      group_id: activity.entity.metadatas.group_id,
      title: activity.entity.metadatas.title,
      serie_title: title,
      image_small: image_small,
      image_medium: image_medium,
      image_large: image_large,
      score: (activity.score) ? activity.score.value : 0,
    }
  case "rate_movie":
    return {
      isFirst: (activity.unique && activity.unique.first !== undefined) ? activity.unique.first : true,
      activity_type: activity.type,
      entity_type: activity.entity.type,
      group_id: activity.entity.metadatas.group_id,
      title: activity.entity.metadatas.title,
      image_small: activity.entity.metadatas.image_small,
      image_background: activity.entity.metadatas.image_background,
      image_large: activity.entity.metadatas.image_large,
      image_medium: activity.entity.metadatas.image_medium,
      score: (activity.score) ? activity.score.value : 0,
    };
  case "rate_tvShow":
    const serie_rate = (activity.entity.metadatas.serie) ? activity.entity.metadatas.serie : {};
    const image_small_rate = serie_rate.image_small || "";
    const image_large_rate = serie_rate.image_large || "";
    const image_medium_rate = serie_rate.image_medium || "";
    const title_rate = serie_rate.title || "";
    return {
      isFirst: (activity.unique && activity.unique.first !== undefined) ? activity.unique.first : true,
      activity_type: activity.type,
      entity_type: activity.entity.type,
      group_id: activity.entity.metadatas.group_id,
      title: activity.entity.metadatas.title,
      serie_title: title_rate,
      image_small: image_small_rate,
      image_large: image_large_rate,
      image_medium: image_medium_rate,
      score: (activity.score) ? activity.score.value : 0,
    };
  default:
    return {
      isFirst: (activity.unique && activity.unique.first !== undefined) ? activity.unique.first : true,
      activity_type: activity.type,
      entity_type: activity.entity.type,
      score: (activity.score) ? activity.score.value : 0,
    };
  }
}