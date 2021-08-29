import { lazy, Suspense, useEffect, useState } from 'react';

import { BrowserRouter, Link, Redirect, Route, Switch } from 'react-router-dom';

import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import AppBar from '@material-ui/core/AppBar';
import CloseIcon from '@material-ui/icons/Close';
import Collapse from '@material-ui/core/Collapse';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import IconButton from '@material-ui/core/IconButton';
import MuiLink from '@material-ui/core/Link';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import logo from './images/logo.png';

import api from './api';

import { LocalizationProvider } from './contexts/localization';
import { AuthenticationProvider } from './contexts/authentication';

import theme from './theme';
import Nav from './components/Nav';
import Spinner from './components/Spinner';

import Home from './pages/Home';

// noinspection JSCheckFunctionSignatures
const Apply = lazy(() => import('./pages/Apply'));
// noinspection JSCheckFunctionSignatures
const View = lazy(() => import('./pages/View'));
// noinspection JSCheckFunctionSignatures
const List = lazy(() => import('./pages/List'));
// noinspection JSCheckFunctionSignatures
const Login = lazy(() => import('./pages/Login'));
// noinspection JSCheckFunctionSignatures
const Register = lazy(() => import('./pages/Register'));
// noinspection JSCheckFunctionSignatures
const FAQ = lazy(() => import('./pages/FAQ'));

const AuthenticatedRoute = ({ children, ...rest }) => (
  <Route
    {...rest}
    render={({ location }) => {
      return api.getUser() ? (
        children
      ) : (
        <Redirect to={{ pathname: '/login', state: { from: location } }} />
      );
    }}
  />
);

const Styles = makeStyles((theme) => ({
  root: {
    flexDirection: 'column',
    display: 'flex',
    minHeight: '100vh'
  },
  appBar: {
    boxShadow: theme.shadows[6]
  },
  toolbar: {
    flexDirection: 'row',
    '& a': {
      color: theme.palette.common.white,
      textDecoration: 'none',
      textTransform: 'uppercase'
    }
  },
  logo: {
    alignItems: 'center',
    display: 'flex',
    marginRight: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      flexGrow: 1
    },
    '& img': {
      height: '40px',
      marginRight: theme.spacing(1)
    }
  },
  container: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3)
  },
  footer: {
    backgroundColor: theme.palette.grey[200],
    marginTop: 'auto',
    padding: theme.spacing(2),
    '& p': {
      textAlign: 'center'
    }
  }
}));

function App() {
  const styles = Styles();
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [user, setUser] = useState(api.getUser());

  useEffect(() => {
    let handle = setTimeout(() => {
      setNoticeOpen(true);
      handle = undefined;
    }, 1000 * 2);

    return () => {
      if (handle) {
        clearTimeout(handle);
      }
    };
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider>
          <AuthenticationProvider user={user} setUser={setUser}>
            <div className={styles.root}>
              <Collapse in={noticeOpen}>
                <Alert
                  severity="warning"
                  action={
                    <IconButton
                      color="inherit"
                      size="small"
                      onClick={() => setNoticeOpen(false)}
                    >
                      <CloseIcon fontSize="inherit" />
                    </IconButton>
                  }
                >
                  Disclaimer: Do not confuse this site with the original
                  movement pass published by Bangladesh Government, it is an
                  educational application that demonstrate how to create an
                  scalable application using AWS Serverless services, you can
                  can find the complete implementation on the following link -
                  <strong>
                    <MuiLink
                      href="https://github.com/movement-pass/movement-pass.github.io"
                      color="inherit"
                    >
                      https://github.com/movement-pass
                    </MuiLink>
                  </strong>
                </Alert>
              </Collapse>
              <AppBar position="relative" className={styles.appBar}>
                <Toolbar className={styles.toolbar}>
                  <Link to="/" className={styles.logo}>
                    <img src={logo} alt="logo" />
                    <Typography variant="h6" component="h1">
                      Movement Pass
                    </Typography>
                  </Link>
                  <Nav />
                </Toolbar>
              </AppBar>
              <Container
                component="main"
                maxWidth="md"
                className={styles.container}
              >
                <Suspense fallback={<Spinner />}>
                  <Switch>
                    <AuthenticatedRoute path="/passes/apply">
                      <Apply />
                    </AuthenticatedRoute>
                    <AuthenticatedRoute path="/passes/:id">
                      <View />
                    </AuthenticatedRoute>
                    <AuthenticatedRoute path="/passes">
                      <List />
                    </AuthenticatedRoute>
                    <Route path="/login">
                      <Login />
                    </Route>
                    <Route path="/register">
                      <Register />
                    </Route>
                    <Route path="/faq">
                      <FAQ />
                    </Route>
                    <Route exact path="/">
                      <Home />
                    </Route>
                  </Switch>
                </Suspense>
              </Container>
              <footer className={styles.footer}>
                <Container maxWidth="md">
                  <Typography variant="body1">
                    © {new Date().getFullYear()} My Organization
                  </Typography>
                </Container>
              </footer>
            </div>
          </AuthenticationProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
