class Social {
  static textMapper(activity, isCurrentUser) {
       	const typeEntity = `${activity.type}_${activity.entity.type}`;

       	const own_social = 'own_social_profile_activity_';
    	const other_social = 'other_social_profile_activity_';
    	const own = `${own_social}${activity.type}`;
    	const other = `${other_social}${activity.type}`;

		switch (typeEntity) {
			case "register_user":
		        const r_user = (isCurrentUser) ? own: other;
		        return { text1: r_user}
		    case "facebook_user":
		        const f_user = (isCurrentUser) ? own: other;
		        return { text1: f_user}
		    case "monthlySubscription_subscription":
	            const m_susc = (isCurrentUser) ? `${own_social}monthly_subscription`: `${other_social}monthly_subscription`;
	            return { text1: m_susc,}
		    case "weeklySubscription_subscription":
		        const w_susc = (isCurrentUser) ? `${own_social}weekly_subscription`: `${other_social}weekly_subscription`;
		        return { text1: w_susc,}
	      	case "favorite_suscAmcoMovie":
	      	case "favorite_suscMovie":
	      	case "favorite_freeMovie":
	      	case "favorite_freeAmcoMovie":
	      	case "favorite_movie":
		        const movie = (isCurrentUser) ? `${own}` : `${other}`;
		        return { text1: movie, text2: activity.entity.metadatas.title, }
	      	case "favorite_suscTvShow":
      		case "favorite_freeTvShow":
     		case "favorite_tvShow":
		        const favoriteTvShow = (isCurrentUser) ? own : other;
        		return {
        			text1: favoriteTvShow,
        			text2: activity.entity.metadatas.title,
              text3: { type: 'translate', text: 'social_profile_view_serie_inter', def:'de la serie' },
        			text4: activity.entity.metadatas.serie.title,
        		}
        	case "beingFollow_user":
        		const follower = (isCurrentUser) ? `${own_social}follower`: `${other_social}follower`
        		return { text1: follower, text2: `${activity.entity.metadatas.name} ${activity.entity.metadatas.lastname}`}
	       	case "follow_user":
	       		const follow = (isCurrentUser) ? own: other;
		        return { text1: follow, text2: `${activity.entity.metadatas.name} ${activity.entity.metadatas.lastname}`}
		    case "watchTrailer_tvShow":
		    case "watchTrailer_freeTvShow":
		    case "watchTrailer_suscTvShow":
		        const textTvShowTrailer = (isCurrentUser) ? `${own_social}watch_trailer`: `${other_social}watch_trailer`;
		        return {
        			text1: textTvShowTrailer,
        			text2: { type: 'translate', text: 'social_profile_view_serie_inter', def:'de la serie' },
        			text3: activity.entity.metadatas.serie.title,
        		}
        	case "beingFollow_user":
        		const beingFollow = (isCurrentUser) ? `${own_social}follower`: `${other_social}follower`;
        		return {
        			text1: beingFollow,
        			text2: activity.entity.metadatas.name,
        		}
        	case "watchTrailer_movie": // este es el documentado pero todos regresan como suscAmcoMovie en lugar de movie
		    case "watchTrailer_suscAmcoMovie":
		    case "watchTrailer_suscMovie":
		    case "watchTrailer_freeMovie":
		    case "watchTrailer_freeAmcoMovie":
		        const textView_trailerMovie = (isCurrentUser) ? `${own_social}watch_trailer`: `${other_social}watch_trailer`;
		        return {
		        	text1: textView_trailerMovie,
		        	text2: activity.entity.metadatas.title,
		        }
		    case "view_live":
		    case "view_livePPE":
		        const textView_live = (isCurrentUser) ? `${own_social}view_live` : `${other_social}view_live`;
		        return { text1: textView_live, text2: activity.entity.metadatas.title, }
		    case "view_allseason":
		        const textView_full_season = (isCurrentUser) ? `${own_social}view_full_season`: `${other_social}view_full_season`;

				return {
					text1: textView_full_season,
					text2: { type: 'translate' , text: 'social_profile_view_serie_inter', def:'de la serie' },
					text3: activity.entity.metadatas.serie.title || null,
				}

        case "view_allserie":
            const textView_full_serie = (isCurrentUser) ? `${own_social}view_full_serie` : `${other_social}view_full_serie`;
            return { text1: textView_full_serie, text2: activity.entity.metadatas.serie.title };

		    case "view_freeMovie":
		        const textView_freeMovie = (isCurrentUser) ? `${own_social}view_movie` : `${other_social}view_movie`;
		        return { text1: textView_freeMovie, text2: activity.entity.metadatas.title}

		    case "view_suscTvShow":
		    case "view_freeTvShow":
		        const textTvShow = (isCurrentUser) ? `${own_social}view`: `${other_social}view`;
		        return {
		        	text1: textTvShow,
		        	text2: activity.entity.metadatas.title,
		        	text3: { type: 'translate', text: 'social_profile_view_serie_inter', def:'de la serie' },
		        	text4: activity.entity.metadatas.serie.title,
		        }

		    case "view_freeAmcoMovie":
		        const textView_freeAmcoMovie = (isCurrentUser) ? `${own_social}view_movie`: `${other_social}view_movie`;
		        return {
		        	text1: textView_freeAmcoMovie,
		        	text2: activity.entity.metadatas.title,
		        	text3: { type: 'translate', text: 'social_profile_view_amco_content'}
		        }
		   	case "view_suscMovie":
		        const textView_suscMovie = (isCurrentUser) ? `${own_social}view_movie` : `${other_social}view_movie`;
		        return {
		        	text1: textView_suscMovie,
		        	text2: activity.entity.metadatas.title,
		        }
		   	case "view_suscAmcoMovie":
		        const textView_suscAmcoMovie = (isCurrentUser) ? `${own_social}view_movie`: `${other_social}view_movie`;
		        return {
		        	text1: textView_suscAmcoMovie,
		        	text2: activity.entity.metadatas.title,
		        	text3: { type: 'translate', text: 'social_profile_view_serie_inter', def:'de la serie' },
		       	}
		    case "purchase_movie":
		        const textPurchase_movie = (isCurrentUser) ? `${own_social}purchase`: `${other_social}purchase`;
				return {
		        	text1: textPurchase_movie,
		        	text2: activity.entity.metadatas.title,
		        }

		    case "rent48_movie":
		    case "rent48_tvShow":
		        const textRent48_movie = (isCurrentUser) ? `${own_social}rent`: `${other_social}rent`;

		        return {
		        	text1: textRent48_movie,
		        	text2: activity.entity.metadatas.title,
		        	text3: { type: 'translate', text: 'social_profile_activity_rent_48_hrs_postfix' },
		       	}
		    case "rent24_movie":
		    case "rent24_tvShow":
		        const textRent24_movie = (isCurrentUser) ? `${own_social}rent`: `${other_social}rent`;
		        return {
		        	text1: textRent24_movie,
		        	text2: activity.entity.metadatas.title,
		        	text3: { type: 'translate', text: 'social_profile_activity_rent_24_hrs_postfix' },
		       	}

		    case "rate_movie":
		        const textRate_movie = (isCurrentUser) ? own : other;
		        return {
		        	text1: textRate_movie,
		        	text2: activity.entity.metadatas.title,
		        }
		   case "purchase_tvShow":
		        const textPurchase_tvShow = (isCurrentUser) ? own : other;
		        return {
		        	text1: textPurchase_tvShow,
		        	text2: activity.title,
		        }
		   	case "rate_tvShow":
		        const textRate_tvShow = (isCurrentUser) ? own : other;

		        return {
		        	text1: textRate_tvShow,
		        	text2: activity.entity.metadatas.title,
		        	text3: { type: 'translate', text: 'social_profile_view_serie_inter', def:'de la serie' },
		        	text4: activity.entity.metadatas.serie.title,
		       	}
	      	default:
		      	const ver = (isCurrentUser) ? `${own_social}view` :`${other_social}view`;
		      	return { text1: ver, text2: 'default' }
       	}

  	}

  	static filterGamesArray(gameId, gamesArray) {
  		if(gamesArray && gameId) {
	        let filter = gamesArray.filter((it) => {
	            return it.id === gameId || it.gameId == gameId;
	        })[0]

	        return filter;
        }
  	}

  	static socialLevel(socialLevels, userSocial, gameId) {
  		if(userSocial && gameId && socialLevels) {

  	  		const gamesArray = this.filterGamesArray(gameId, userSocial.gamesArray)
  	  		if(gamesArray) {
    		  		const level = gamesArray.level && gamesArray.level.number ? `level${gamesArray.level.number}`: 'level0';
    		  		const nextLevel = gamesArray.level && gamesArray.level.number ? `level${gamesArray.level.number + 1 }`: 'level1';

    		  		return {
    		  			level_name : level && socialLevels[level] ? socialLevels[level].level_name || socialLevels['default'].level_name : undefined ,
    		  			level_asset: level && socialLevels[level] ? socialLevels[level].level_asset || socialLevels['default'].level_asset : undefined,
    		  			level: gamesArray.level && gamesArray.level.number ? gamesArray.level.number: 0,
    		  			nextLevel: nextLevel && socialLevels[nextLevel] ? socialLevels[nextLevel].level_name || socialLevels['default'].level_name: undefined,
    		  		}

  	  		}

	  	}

	  	return null;

  	}

    static next(skip, limit) {
		const lim = Number(limit);
		const ski = (Number(skip) + lim);
        return { skip: ski, limit: lim};
  	}

  	static previous(skip, limit){
		let ski;
		let lim = Number(limit);
		ski = (skip > 0) ? (Number(skip) - lim) : skip;
        return { skip: ski, limit: lim };
  	}

  	static porcentageProgressBar(games_array) {
  		if(games_array) {
              let p = (games_array.points != 0) ? games_array.points * 100 / games_array.level.max : 0;
              return (Number(p).toFixed(0));
          }
  	}

    static isAnonymous(user) {
        return user.isAnonymous ? true : false;
    }

    static buildParams(userLogged, card) {
        return {
            userId: userLogged,
            candidateUserId: card.id,
        }
    }

    static parseFollowers(followers, card, task) {
        return followers.map((it) => {
            if(it.id === card.id) {
                it.following = (task == 'follow') ? true : false;
            }

            return it;
        })
    }

    static getDispatch = (task) => {
        const dispatcher = {
            follow: () => { return 'incOwnFollowings' },
            unfollow: () => { return 'decOwnFollowings' }
        }

        return dispatcher[task]();
    }

}

export default Social;
