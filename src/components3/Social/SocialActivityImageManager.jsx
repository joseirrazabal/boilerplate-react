import React, { Component }  from 'react';
import SocialActivityImage  from './SocialActivityImage';
import SocialAvatar from './SocialAvatar';
import Card, { cardTypes } from './../Card';
import focusSettings from './../Focus/settings';

const SocialActivityImageManager = (props) => {
	this.ribbonId = props.id || `cv-${new Date().getTime()}`;

	//Esto va a Utils
	const imageMapper = (activity) => {
	  let cover = activity.entity && activity.entity.metadatas ? activity.entity.metadatas.image_small: null;
		switch(activity.entity.type) {
			case 'user':
				return(<div className="box-avatar">
					<SocialAvatar
            large
            id={props.id}
            userSocial={activity.entity}
            href={`/socialProfile/${activity.entity.id.$oid}`}
            focusUp={props.focusUp}
          />
				</div>)
				break
			case 'allseason':
			case 'allserie':
			  cover = activity.entity && activity.entity.metadatas ? activity.entity.metadatas.serie.image_small : null;
			case 'suscTvShow':
			case 'suscAmcoMovie':
			case 'movie':
			case 'freeTvShow':
			case 'freeAmcoMovie':
			case 'freeMovie':
			case 'suscMovie':
			case 'tvShow':
			case 'live':
			case 'livePPE':
			  const groupId = activity.entity && activity.entity.metadatas ? activity.entity.metadatas.group_id : null;
			  const href = groupId ? `/vcard/${groupId}` : null;
				return(
				  <div className="activity-image">
            { activity &&
              <Card
                id={props.id}
                className={props.className}
                data={activity}
                cover={cover}
            	  group_id={groupId}
                focusUp={props.focusUp}
                focusRight={`#${this.ribbonId} ${focusSettings.selector}`}
            	  focusLeft={`#${this.ribbonId} ${focusSettings.selector}`}
            	  href={href}
              />
            }
          </div>
        )
				break
			case 'default':
				return null
		}
	}

	return(<div className="activity-image-manager">
		{ imageMapper(props.activity) }
	</div>)
}

export default SocialActivityImageManager;
