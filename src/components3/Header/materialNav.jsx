import React from 'react';
import clsx from 'clsx';

// Material Components
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    height: 720,
    maxWidth: 50,
    position: 'fixed'
  },
  paper: {
    height: 720,
    background: theme.palette.default.main
  },
  menuButton: {
    marginRight: 36,
  },
  heightDrawer: {
    height: 720
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    height: 720,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: 50,
    [theme.breakpoints.up('sm')]: {
      width: 50,
    },
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

const PersistentDrawerLeft = (props) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(props.menuVisible ? true : false);

  React.useEffect(() => {
    setOpen(props.menuVisible)
  }, [ props.menuVisible ])

  function handleDrawerOpen() {
    setOpen(true);
  }

  function handleDrawerClose() {
    setOpen(false);
  }

  return (
    <div id="navHeader" className={classes.root} style={{zIndex: 999 }}>
      <Drawer
        onFocus={handleDrawerOpen}
        onBlur={handleDrawerClose}
        onClick={handleDrawerClose}
        variant="permanent"
        anchor="left"
        open={open}
        // style={{display: open ? 'block' : 'none'}}
        className={clsx(classes.drawer,{
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx(classes.paper,{
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
      >
        { open ?
        <div className="header-logo">
          <img
            width={100}
            src={require("./Logo_Claro.png")}
            alt="claroTv logo"
          />
        </div> : null}
        {props.children}
      </Drawer>

    </div>
  );
}

export default PersistentDrawerLeft
