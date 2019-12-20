import React, { PureComponent } from "react";
import "./Debug.css";

class Debug extends PureComponent {
  render(props) {
    return (
      <div className='debug-flyright'>
        Debug:
        <br />
        {JSON.stringify(this.props.msg)}
      </div>
    );
  }
}

export default Debug;