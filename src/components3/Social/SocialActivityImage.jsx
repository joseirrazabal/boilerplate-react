import React from 'react'

const SocialActivityImage = (props) => {
	return(
		<div className="activity-image">
			<a className="focusable" href={props.href}>
				<img alt={props.href} src={props.entity.metadatas.image_small || 'https://www.clarovideo.com/webclient/sk_core/images/place_hl.png' } />
			</a>	
		</div>
	)
}

export default SocialActivityImage;