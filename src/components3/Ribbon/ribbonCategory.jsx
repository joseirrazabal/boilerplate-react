import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { connect } from 'react-redux';
import { NavLink, Link } from "react-router-dom";
import focusSettings from "../../components/Focus/settings";

// Components

// Material Components
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

// Requests
import Assets from "../../requests/apa/Asset";
import Metadata from '../../requests/apa/Metadata';

// Packages
import Slider from "react-slick";

var settings = {
    dots: false,
    arrows: true,
    infinite: false,
    initialSlide: 0,
    slidesToShow: 7,
    slidesToScroll: 0
};
//const items = [1,2,3,4,5,6,7,8,9,10];

class RibbonCategoryList extends React.PureComponent {

  render() {

    const { classes, title } = this.props;
    
    return (
      <React.Fragment>   
        <Grid container spacing={0} className={classes.global}>
            <Grid item xs={12}>
                <Slider {...settings}>
                  
                  {this.props.datainfo.submenu.submenuProps.map(e => (
                   <div>
                      <Link to={`/categorias`} style={{ color: "white" }}>{e.text}</Link>
                   </div>
               ))}

                </Slider>
            </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}
RibbonCategoryList.propTypes = {
  ...withStyles,
  title: PropTypes.string,

};
RibbonCategoryList.defaultProps = {
  title: 'titlulo ejemplo'
};

const styles = theme => ({
  global: {
    backgroundColor: "black"
  }
});
const mapStateToProps = state => ({ submenuProps: state.submenu.submenuProps, datainfo: state });
export default connect(mapStateToProps, null)(withStyles(styles)(RibbonCategoryList));