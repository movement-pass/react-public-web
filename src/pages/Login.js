import get from 'lodash.get';
import * as yup from 'yup';

import { useContext, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';

import { useFormik } from 'formik';

import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import api from '../api';

import { AuthenticationContext } from '../contexts/authentication';

const Styles = makeStyles((theme) => ({
  form: {
    marginTop: theme.spacing(3),
    '& a': {
      textDecoration: 'none'
    }
  }
}));

function Login() {
  const styles = Styles();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState(null);
  const { setUser } = useContext(AuthenticationContext);
  const history = useHistory();
  const { state } = useLocation();

  const { errors, isSubmitting, handleChange, handleSubmit, touched, values } =
    useFormik({
      initialValues: {
        mobilePhone: '',
        dateOfBirth: ''
      },
      validationSchema: yup.object().shape({
        mobilePhone: yup
          .string()
          .label('Mobile phone number')
          .required()
          .matches(
            /^01[3-9]\d{8}$/,
            'Invalid mobile phone number, must be 11 character digit'
          ),
        dateOfBirth: yup
          .string()
          .label('Date of birth')
          .required()
          .matches(
            /^\d{8}$/,
            'Invalid date of birth, must be in ddmmyyyy format'
          )
      }),
      onSubmit: async (fields) => {
        setWorking(true);
        showError(null);

        try {
          const res = await api.login(fields);

          if (!res) {
            setUser(api.getUser());
            history.push(state?.from || '/');
          }

          setError(res.errors[0]);
        } catch (e) {
          setError('An unexpected error has occurred, please try again!');
        } finally {
          setWorking(false);
        }
      }
    });

  const showError = (name) =>
    Boolean(get(errors, name)) && (Boolean(get(touched, name)) || isSubmitting);

  const errorText = (name) => (showError(name) ? get(errors, name) : null);

  return (
    <Container maxWidth="xs">
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2">
            Login
          </Typography>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  id="mobilePhone"
                  name="mobilePhone"
                  type="text"
                  label="Mobile phone number"
                  variant="outlined"
                  value={values.mobilePhone}
                  onChange={handleChange}
                  error={showError('mobilePhone')}
                  helperText={errorText('mobilePhone') || 'e.g. 01512345678'}
                  inputProps={{ maxLength: 11 }}
                  autoFocus
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="text"
                  label="Date of birth"
                  variant="outlined"
                  value={values.dateOfBirth}
                  onChange={handleChange}
                  error={showError('dateOfBirth')}
                  helperText={
                    errorText('dateOfBirth') ||
                    'if your date of birth is 16/12/1971, then type 16121971'
                  }
                  inputProps={{ maxLength: 8 }}
                  fullWidth
                  required
                />
              </Grid>
              {error && (
                <Grid item xs={12}>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={working}
                  fullWidth
                >
                  Log In
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Link to="/register">
                  <Button type="button" fullWidth>
                    Please register, if you don't have an account
                  </Button>
                </Link>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}

export default Login;
