import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

// Components
import focusSetting from "./../Focus/settings";

// Material Components
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
    card: {
      display: 'flex',
      maxWidth: 300,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    },
    bigAvatar: {
        height: 100,
        width: 100
    }
});

const CardMovies = ({id, className, title, cover, focusable}) => {

const classes = useStyles();
const focusClassName = focusable ? focusSetting.className : focusSetting.nonfocusable;

  return (
    <div id={id} className={classNames(classes.card, className)}>
        <Avatar alt={title} src={cover} className={classes.bigAvatar} />
        <Typography variant="body2" gutterBottom>{title}</Typography>
    </div>
  );
}
CardMovies.propTypes = {
  className: PropTypes.string,
  group_id: PropTypes.string,
  data: PropTypes.object,
  cover: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]),
  title: PropTypes.string,
  label: PropTypes.string,
  href: PropTypes.string,
  bookmark: PropTypes.string,
  focusable: PropTypes.bool,
  focusUp: PropTypes.string,
  focusRight: PropTypes.string,
  focusLeft: PropTypes.string,
  sibling: PropTypes.string,
  filterTV: PropTypes.string,
  badgesAlign: PropTypes.oneOf(['left', 'right']),
  badges: PropTypes.arrayOf(PropTypes.object),
  badgesHtml: PropTypes.string,
  unFocusHandler: PropTypes.func,
  clickHandler: PropTypes.func,
  onClickCb: PropTypes.func,
  focusHandler: PropTypes.func,
  setMetricsEvent: PropTypes.func,
  keyUpHandler: PropTypes.func,
  keyDownHandler: PropTypes.func,
  onLoadHandler: PropTypes.func,
  typeRender: PropTypes.string,
};

CardMovies.defaultProps = {
  id: null,
  className: '',
  group_id: '',
  data: {},
  cover: '',
  title: '',
  label: '',
  href: null,
  bookmark:0,
  type: 'landscape',
  focusable: true,
  focusUp: null,
  focusRight: null,
  focusLeft: null,
  sibling: null,
  filterTV: '',
  badgesAlign: 'right',
  badges: [],
  badgesHtml: '',
  unFocusHandler: null,
  clickHandler: null,
  focusHandler: null,
  setMetricsEvent: null,
  keyUpHandler: null,
  keyDownHandler: null,
  onLoadHandler: null,
  onClickCb: null,
  typeRender: null
};

export default CardMovies;