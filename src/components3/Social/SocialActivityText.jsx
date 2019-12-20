import React   from 'react';
import Social from '../../utils/social/Social';

const SocialActivityText = (props) => {

	const getText = (t, Trans) => {
		if(t) {
			if(typeof(t) === 'object') {
				if(t.def)
					return Trans.get(t.text, t.def);
				else
					return Trans.get(t.text, null);
			}
			else return <span style={{fontWeight: 'bolder', fontSize: '18px'}}>{t}</span>;
		}
	}


	const obj = Social.textMapper(props.activity, props.isCurrentUser);
	const text1 = obj.text1 ? props.translations.get(obj.text1, null) : null;
	const text2 = obj.text2 ? getText(obj.text2, props.translations): null;
	const text3 = obj.text3 ? getText(obj.text3, props.translations): null;
	const text4 = obj.text3 ? getText(obj.text4, props.translations): null;

	return(<div className="social-activity_text-div">
		<div><p>{ text1 } { text2 } { text3 } { text4 }</p></div>
	</div>)
}

export default SocialActivityText;
