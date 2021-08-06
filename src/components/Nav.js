import { useContext, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuIcon from '@material-ui/icons/Menu';

import navigation from '../data/navigation';

import api from '../api';

import { LocalizationContext } from '../contexts/localization';
import { AuthenticationContext } from '../contexts/authentication';

const Styles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.up('md')]: {
      display: 'flex',
      justifyContent: 'flex-end',
      flexGrow: 1,
      '& a': {
        marginLeft: theme.spacing(3)
      }
    }
  },
  drawer: {
    paddingTop: '56px',
    width: '240px',
    '& a': {
      color: theme.palette.text.primary,
      textDecoration: 'none'
    }
  },
  menuButton: {
    color: theme.palette.primary.contrastText
  }
}));

function Nav() {
  const styles = Styles();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const history = useHistory();
  const culture = useContext(LocalizationContext);
  const { user, setUser } = useContext(AuthenticationContext);

  const toggleMobileDrawer = () => setMobileDrawerOpen(!mobileDrawerOpen);

  const handleLogout = () => {
    setMobileDrawerOpen(false);
    api.logout();
    setUser(null);
    history.push('/');
  };

  return (
    <nav className={styles.root}>
      <Hidden mdUp>
        <IconButton className={styles.menuButton} onClick={toggleMobileDrawer}>
          <MenuIcon />
        </IconButton>
        <Drawer
          variant="temporary"
          anchor="right"
          classes={{ paper: styles.drawer }}
          open={mobileDrawerOpen}
          onClose={toggleMobileDrawer}
        >
          <Divider />
          <List>
            <Link to={navigation.apply.path} onClick={toggleMobileDrawer}>
              <ListItem button>
                <ListItemIcon>{navigation.apply.icon}</ListItemIcon>
                <ListItemText primary={navigation.apply.text[culture]} />
              </ListItem>
            </Link>
            <Link to={navigation.collect.path} onClick={toggleMobileDrawer}>
              <ListItem button>
                <ListItemIcon>{navigation.collect.icon}</ListItemIcon>
                <ListItemText primary={navigation.collect.text[culture]} />
              </ListItem>
            </Link>
            <Link to={navigation.faq.path} onClick={toggleMobileDrawer}>
              <ListItem button>
                <ListItemIcon>{navigation.faq.icon}</ListItemIcon>
                <ListItemText primary={navigation.faq.text[culture]} />
              </ListItem>
            </Link>
            {user ? (
              <ListItem button onClick={handleLogout}>
                <ListItemIcon>{navigation.logout.icon}</ListItemIcon>
                <ListItemText primary={navigation.logout.text[culture]} />
              </ListItem>
            ) : (
              <>
                <Link
                  to={navigation.register.path}
                  onClick={toggleMobileDrawer}
                >
                  <ListItem button>
                    <ListItemIcon>{navigation.register.icon}</ListItemIcon>
                    <ListItemText primary={navigation.register.text[culture]} />
                  </ListItem>
                </Link>
                <Link to={navigation.login.path} onClick={toggleMobileDrawer}>
                  <ListItem button>
                    <ListItemIcon>{navigation.login.icon}</ListItemIcon>
                    <ListItemText primary={navigation.login.text[culture]} />
                  </ListItem>
                </Link>
              </>
            )}
          </List>
        </Drawer>
      </Hidden>
      <Hidden smDown>
        <Link to={navigation.apply.path}>
          <Button
            color="secondary"
            variant="contained"
            startIcon={navigation.apply.icon}
          >
            {navigation.apply.text[culture]}
          </Button>
        </Link>
        <Link to={navigation.collect.path}>
          <Button color="inherit" startIcon={navigation.collect.icon}>
            {navigation.collect.text[culture]}
          </Button>
        </Link>
        <Link to={navigation.faq.path}>
          <Button color="inherit" startIcon={navigation.faq.icon}>
            {navigation.faq.text[culture]}
          </Button>
        </Link>
        {user ? (
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={navigation.logout.icon}
          >
            {navigation.logout.text[culture]}
          </Button>
        ) : (
          <>
            <Link to={navigation.register.path}>
              <Button color="inherit" startIcon={navigation.register.icon}>
                {navigation.register.text[culture]}
              </Button>
            </Link>
            <Link to={navigation.login.path}>
              <Button color="inherit" startIcon={navigation.login.icon}>
                {navigation.login.text[culture]}
              </Button>
            </Link>
          </>
        )}
      </Hidden>
    </nav>
  );
}

export default Nav;
