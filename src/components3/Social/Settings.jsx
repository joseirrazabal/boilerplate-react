import React   from 'react';
import { Link } from 'react-router-dom';

const Settings = (props) => {
	return(<div className="settings">
			<Link to={props.link} className="focusable">
					<span className="settings-text">{ props.translations.get('stb_menu_settings', 'Ajustes')}</span>
					<span className="settings-icon fa fa-cog"></span>
			</Link>
		</div>)
}

export default Settings;
