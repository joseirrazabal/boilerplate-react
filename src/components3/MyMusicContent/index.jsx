import './myContent.css';
import React, {Component} from "react";
import MusicGrid from '../../components/MusicGrid'
import RibbonsUtil from "../../utils/RibbonsUtil";
import Placeholder from '../../containers/Placeholder';
import { connect } from 'react-redux';

class MyContent extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isFetching: true,
      common: null,
      seasons: null,
      purchaseButtonInfo: null,
      user: props.user,
      items:[],
      index: 0,
      size: 30,
      reloadGrid: false,
      service: props.service,
      type: props.cardType,
      content: props.content,
      showMyContentPlaceholder: true,
    };
    this.fetchMoreLists = this.fetchMoreLists.bind(this);
    this.toggleFavorite = this.toggleFavorite.bind(this);
  }

  componentDidMount(){
    if (this.props.user.musicUser !== undefined){
      this.fetchMoreLists(this.state.user.musicUser);
    }
  }

  fetchMoreLists(user){
    if (!user) user = this.props.user.musicUser;
    this.setState({ isFetching: true});
    this.props.setIsFetching(true);
    const musicRb = new RibbonsUtil();
    musicRb.getMusicListFromApi(this.props.service, user,{countryCode: user.countryCode}).then(
      (resp) => {

        const items = resp;

        this.setState({
          items,
          index: this.state.index + this.state.size,
          isFetching: false,
          reloadGrid: false,
          showMyContentPlaceholder: items.length <= 0
        });

      }
    ).catch(
      (err) => {
        this.setState({
          isFetching: false,
          showMyContentPlaceholder: true,
        });
        this.props.setIsFetching(false);
      }
    );
  }

  toggleFavorite(item){
    console.log('my content toggle',item)
    const items = this.state.items;
    const index = items.findIndex((artist) => item.id === artist.id);
    items[index] = item;
    this.setState({items});
  }

  render() {
    console.log('render mimusica/myContent');
    if (!this.state.showMyContentPlaceholder) {
      return (
        <MusicGrid
          items={this.state.items}
          onFocusHandler={this.props.onFocusCardHandler}
          reload={ this.state.reloadGrid }
          getMore = {this.fetchMoreLists}
          type={this.state.type}
          service={this.state.service}
          gridType={this.props.content}
        />
      )
    } else {
      return(
       <Placeholder
         type={this.state.content}
         onFocusHandler={this.props.onFocusCardHandler}
       />
      )
    }

  }
}

export default connect(null, null,  null, { withRef: true })(MyContent);
