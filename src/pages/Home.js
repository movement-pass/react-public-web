import { useContext } from 'react';
import { Link } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import logo from '../images/logo.png';

import navigation from '../data/navigation';

import { LocalizationContext } from '../contexts/localization';
import { AuthenticationContext } from '../contexts/authentication';

const Styles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row'
    },
    '& a': {
      textDecoration: 'none'
    }
  },
  avatar: {
    width: theme.spacing(24),
    height: theme.spacing(24)
  },
  actionPane: {
    [theme.breakpoints.up('md')]: {
      marginLeft: theme.spacing(3)
    },
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(3)
    }
  },
  notes: {
    marginBottom: theme.spacing(2)
  }
}));

function Home() {
  const styles = Styles();
  const culture = useContext(LocalizationContext);
  const { user } = useContext(AuthenticationContext);

  return (
    <Card>
      <CardContent className={styles.root}>
        <Avatar src={user ? user.photo : logo} className={styles.avatar} />
        <div className={styles.actionPane}>
          <Typography
            variant="subtitle1"
            component="p"
            className={styles.notes}
          >
            Greetings{user ? <strong> {user.name}</strong> : ''}! Only in case
            of emergency, you can use this tool to get permission from the
            concerned department of government to go outside of your home by
            maintaining the hygiene rules during the lockdown period.
          </Typography>
          <Grid container spacing={2}>
            {!user && (
              <Grid item sm={4} xs={12}>
                <Link to={navigation.register.path}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={navigation.register.icon}
                    fullWidth
                  >
                    {navigation.register.text[culture]}
                  </Button>
                </Link>
              </Grid>
            )}
            <Grid item sm={user ? 6 : 4} xs={12}>
              <Link to={navigation.apply.path}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={navigation.apply.icon}
                  fullWidth
                >
                  {navigation.apply.text[culture]}
                </Button>
              </Link>
            </Grid>
            <Grid item sm={user ? 6 : 4} xs={12}>
              <Link to={navigation.collect.path}>
                <Button
                  variant="contained"
                  color="default"
                  startIcon={navigation.collect.icon}
                  fullWidth
                >
                  {navigation.collect.text[culture]}
                </Button>
              </Link>
            </Grid>
          </Grid>
        </div>
      </CardContent>
    </Card>
  );
}

export default Home;
