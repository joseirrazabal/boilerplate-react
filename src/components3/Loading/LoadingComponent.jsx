import React from "react"
import PropTypes from 'prop-types'

// Material Components
import { withStyles } from "@material-ui/core/styles"

// Another way to import
import PulseLoader from "react-spinners/PulseLoader"

class LoadingComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  render() {
    const { classes, image, title, background } = this.props;
    return (
      <div
        className={`flex column jc-center ai-center ${classes.containerLoading}`}
        style={{background: background}}
      >
        {image ? <img className={classes.imgLogin} src={require("../../components/Header/Logo_Claro.png")} /> : null}
        <p className={classes.text}>{title}</p>
        <PulseLoader
          sizeUnit={"px"}
          size={18}
          color={"red"}
          loading={this.state.loading}
        />
      </div>
    );
  }
}
LoadingComponent.propTypes = {
  background: PropTypes.string,
  title: PropTypes.string,
  image: PropTypes.bool
};

LoadingComponent.defaultProps = {
  background: 'transparent',
  title: null,
  image: false
};
const styles = () => ({
  containerLoading: {
    position: "absolute",
    zIndex: 10,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%"
  },
  text: {
    fontSize: 24,
  },
  imgLogin: {
    height: 50,
    marginBottom: 30
  }
});
export default withStyles(styles)(LoadingComponent);