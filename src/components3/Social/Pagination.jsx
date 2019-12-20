import React, { Component }  from 'react';
import PropTypes from 'prop-types';
import Utils_social from '../../utils/social/Social';

const Pagination = (props) => {
	
	const button_1 = props.page == 1 ? 'button-disabled': 'button-enabled focusable';
	const button_3 = (Number(props.activities.length) < Number(props.limit )) ? 'button-disabled': 'button-enabled focusable';

	return(<div className="pagination">
	  	<button
	  		name={Utils_social.previous(props.skip, props.limit)}
	  		className={`pagination-button ${button_1}`}
	  		onClick={(e) => props.getData(e, Utils_social.previous(props.skip, props.limit))}
        data-sn-up={'.social .activities .social-activity:last-child .focusable'}
	  	>
	  		{props.translations.get('social_pagination_previous', 'Previo')}
	  	</button>
	  	<button className="pagination-button button-page" style={{width: '80px'}}>{props.page}</button>
	  	<button
	  		name={Utils_social.next(props.skip, props.limit)}
	  		className={`pagination-button ${button_3}`}
	  		onClick={(e) => props.getData(e, Utils_social.next(props.skip, props.limit))}
        data-sn-up={'.social .activities .social-activity:last-child .focusable'}
	  	>
		  	{props.translations.get('social_pagination_next', 'Siguiente')}
		</button>
	</div>)
}

Pagination.propTypes = {
  translations: PropTypes.object.isRequired,
};

export default Pagination;
