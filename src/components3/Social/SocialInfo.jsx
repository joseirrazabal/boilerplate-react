import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Settings from './Settings';
import SocialCardButton from "./SocialCardButton";
import Translator from "../../requests/apa/Translator";
import RequestManager from "../../requests/RequestManager";
import FollowTask from "../../requests/tasks/social/follow/followTask";
import UnfollowTask from "../../requests/tasks/social/unfollow/unfollowTask";
import { showModal, MODAL_GENERIC, MODAL_ERROR } from '../../actions/modal';
import Social from '../../utils/social/Social';
import { connect } from 'react-redux';

class SocialInfo extends Component {

  static propTypes = {
    userSocial: PropTypes.object,
    isCurrentUser: PropTypes.bool,
    gamificationIdUserlogged: PropTypes.string,
    incOwnFollowings: PropTypes.func,
    decOwnFollowings: PropTypes.func,
    ownFollowings: PropTypes.arrayOf(PropTypes.object),
  };

  static defaultProps = {
    userSocial: {},
    isCurrentUser: true,
    gamificationIdUserlogged: '',
    incOwnFollowings: () => { console.warn('social incOwnFollowings not implemented') },
    decOwnFollowings: () => { console.warn('social decOwnFollowings not implemented') },
    ownFollowings: [],
  };

  constructor(props) {
    super(props);

    const currentUserProfileId = props.userSocial.id;
    const following = this.isLoggedUserFollowingCurrentUser(props.ownFollowings, currentUserProfileId);
    this.state = {
      currentUserProfileId,
      following,
    };

    this.settingsLink = '/user-settings/idioma';
    this.callToAction = this.callToAction.bind(this);
  }

  isLoggedUserFollowingCurrentUser(ownFollowings, currentUserProfileId) {
    return Array.isArray(ownFollowings) &&
      ownFollowings.findIndex(f => f.id == currentUserProfileId) !== -1;
  }

  warningModal = () => {
      const buttons = [{
          content: Translator.get('btn_modal_ok','Aceptar'),
          props: {},
      }]

      const newModal = {
        modalType: MODAL_GENERIC,
        modalProps: {
          title: Translator.get('social_title_ups', 'Ops!'),
          content: Translator.get(
              'social_modal_anonymous',
              'Para poder seguir usuarios necesitas iniciar sesión o registrarte'
          ),
          buttons,
          buttonsAlign: 'vertical'
        }
      };

      this.props.showModal(newModal);
  }

  executeChuck = (currentUserProfileId) => {
      const taskParams = {
        userId: this.props.gamificationIdUserlogged,
        candidateUserId: currentUserProfileId,
      };

      const task = this.state.following ? new UnfollowTask(taskParams) : new FollowTask(taskParams);
      const request = RequestManager.addRequest(task);
      request
          .then(result => this.success(result, currentUserProfileId))
          .catch((e) => this.error(e));
  }

  error = (e) => {
      const modal = {
          modalType: MODAL_ERROR,
          modalProps: {
              content: e,
          }
      }

      this.props.showModal(modal);
  }

  success = (result, currentUserProfileId) => {
      if (!this.state.following) {
          this.props.incOwnFollowings(currentUserProfileId);
      } else {
          this.props.decOwnFollowings(currentUserProfileId);
      }

      if(result.response.status == true) {
          this.setState(prevState => ({
              following: !prevState.following,
          }));
      }

  }

  callToAction (event, currentUserProfileId) {
    const action = !Social.isAnonymous(this.props.user) ? 'executeChuck' : 'warningModal';
    this[action](currentUserProfileId);
  }

  render() {

    const { following, currentUserProfileId } = this.state;
    let className = following ? 'card-following': 'card-follower';
    if(this.props.user.isAnonymous) className = 'card-follower';

    const action = following ? Translator.get('social_profile_card_following', 'Siguiendo') : Translator.get('social_follow', 'Seguir');

    const button = this.props.isCurrentUser ?
      <Settings
        link={this.settingsLink}
        translations={Translator}
      />
      :
      <div style={{ marginTop: 25 }}>
        <SocialCardButton
          action={action}
          className={className}
          callToAction={ this.callToAction }
          card={ currentUserProfileId }
        />
      </div>;

    const { userSocial } = this.props;
    let { name } = userSocial.metadatas;
    name = name ? name : '';

    return (
      <div className="info">
        <div className="info-name">{
          this.props.isCurrentUser &&
          this.props.nameFromisloggedin ?
          this.props.nameFromisloggedin:`${name}` }
          </div>
        <div className="info-follows-followers">
          <span> { Translator.get('social_following', 'siguiendo')} { userSocial.follows } </span>
          <span> { Translator.get('social_followers', 'seguidores')} { userSocial.followers } </span>
        </div>
        { button }
      </div>
    )
  }
}

export default connect(null, { showModal })(SocialInfo);
