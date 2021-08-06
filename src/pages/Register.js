import * as yup from 'yup';
import get from 'lodash.get';
import dayjs from 'dayjs';
import DateFnsUtils from '@date-io/dayjs';

import { useContext, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useFormik } from 'formik';

import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import Districts from '../data/locations.json';
import Genders from '../data/genders';
import IDTypes from '../data/id-types';

import api from '../api';

import { LocalizationContext } from '../contexts/localization';
import { AuthenticationContext } from '../contexts/authentication';

const MAX_PHOTO_SIZE = 1024 * 1024 * 2;
const SUPPORTED_PHOTO_TYPES = ['image/png', 'image/jpg', 'image/jpeg'];

const Styles = makeStyles((theme) => ({
  form: {
    marginTop: theme.spacing(3),
    '& a': {
      textDecoration: 'none'
    }
  },
  photoContainer: {
    width: '100%'
  }
}));

function Register() {
  const styles = Styles();
  const [thanas, setThanas] = useState([]);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState(null);
  const culture = useContext(LocalizationContext);
  const { setUser } = useContext(AuthenticationContext);
  const history = useHistory();

  const {
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFieldValue,
    touched,
    values
  } = useFormik({
    initialValues: {
      name: '',
      mobilePhone: '',
      district: null,
      thana: null,
      dateOfBirth: null,
      gender: '',
      idType: '',
      idNumber: '',
      photo: null
    },
    validationSchema: yup.object().shape({
      name: yup.string().label('Name').required().max(64),
      mobilePhone: yup
        .string()
        .label('Mobile phone number')
        .required()
        .matches(
          /^01[3-9]\d{8}$/,
          'Invalid mobile phone number, must be 11 character digit'
        ),
      district: yup.mixed().label('District').required(),
      thana: yup.mixed().label('Thana').required(),
      dateOfBirth: yup
        .date()
        .label('Date of birth')
        .required()
        .nullable()
        .max(
          dayjs().subtract(18, 'years').toDate(),
          'Age must 18 years or more'
        ),
      gender: yup.string().label('Gender').required(),
      idType: yup.string().label('Type of identification').required(),
      idNumber: yup.string().label('ID number').required().max(64),
      photo: yup
        .mixed()
        .label('Photo')
        .required()
        .test(
          'type',
          'Photo must be in png or jpeg format',
          (value) => value && SUPPORTED_PHOTO_TYPES.indexOf(value.type) > -1
        )
        .test(
          'size',
          'Photo cannot exceed 2MB in size',
          (value) => value && value.size <= MAX_PHOTO_SIZE
        )
    }),
    onSubmit: async (fields) => {
      setWorking(true);
      showError(null);

      try {
        const photo = await api.uploadPhoto(fields.photo);

        const input = {
          ...fields,
          dateOfBirth: dayjs(fields.dateOfBirth).format('YYYY-MM-DD'),
          district: fields.district.id,
          thana: fields.thana.id,
          photo: photo
        };

        const res = await api.register(input);

        if (!res) {
          setUser(api.getUser());
          return history.push('/');
        }

        setError(res.errors[0]);
      } catch (e) {
        setError('An unexpected error has occurred, please try again!');
      } finally {
        setWorking(false);
      }
    }
  });

  const handleDistrictChange = (_, value) => {
    setFieldValue('district', value);
    setFieldValue('thana', null);

    if (value) {
      const district = Districts.find((d) => d.id === value.id);
      // noinspection JSUnresolvedVariable
      setThanas(district.thanas);
    } else {
      setThanas([]);
    }
  };

  const handleThanaChange = (_, value) => setFieldValue('thana', value);

  const handleDateOfBirthChange = (value) =>
    setFieldValue('dateOfBirth', value);

  const handlePhotoChange = (e) => setFieldValue('photo', e.target.files[0]);

  const showError = (name) =>
    Boolean(get(errors, name)) && (Boolean(get(touched, name)) || isSubmitting);

  const errorText = (name) => (showError(name) ? get(errors, name) : null);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2">
          Registration
        </Typography>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  id="name"
                  name="name"
                  label="Name"
                  variant="outlined"
                  value={values.name}
                  onChange={handleChange}
                  error={showError('name')}
                  helperText={errorText('name') || 'Enter your full name'}
                  inputProps={{ maxLength: 64 }}
                  fullWidth
                  autoFocus
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  id="mobilePhone"
                  name="mobilePhone"
                  type="tel"
                  label="Mobile phone number"
                  variant="outlined"
                  value={values.mobilePhone}
                  onChange={handleChange}
                  error={showError('mobilePhone')}
                  helperText={errorText('mobilePhone') || 'e.g. 01512345678'}
                  inputProps={{ maxLength: 11 }}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  id="district"
                  noOptionsText="No matching district"
                  value={values.district}
                  onChange={handleDistrictChange}
                  options={Districts}
                  getOptionLabel={(opt) => opt[culture]}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="district"
                      label="District"
                      variant="outlined"
                      error={showError('district')}
                      helperText={
                        errorText('district') ||
                        'If you live inside metropolitan area, select metro e.g. Dhaka Metro'
                      }
                      required
                    />
                  )}
                  openOnFocus
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  id="thana"
                  noOptionsText="No matching thana"
                  value={values.thana}
                  onChange={handleThanaChange}
                  options={thanas}
                  getOptionLabel={(opt) => opt[culture]}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="thana"
                      label="Thana / Police Station"
                      variant="outlined"
                      error={showError('thana')}
                      helperText={errorText('thana')}
                      required
                    />
                  )}
                  openOnFocus
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  id="dateOfBirth"
                  name="dateOfBirth"
                  label="Date of birth"
                  inputVariant="outlined"
                  format="DD/MM/YYYY"
                  openTo="year"
                  disableFuture={true}
                  initialFocusedDate={dayjs().subtract(18, 'years').toDate()}
                  minDate={dayjs().subtract(150, 'years').toDate()}
                  maxDate={dayjs().subtract(18, 'years').toDate()}
                  value={values.dateOfBirth}
                  onChange={handleDateOfBirthChange}
                  error={showError('dateOfBirth')}
                  helperText={errorText('dateOfBirth')}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  id="gender"
                  name="gender"
                  label="Gender"
                  variant="outlined"
                  value={values.gender}
                  onChange={handleChange}
                  error={showError('gender')}
                  helperText={errorText('gender')}
                  select
                  fullWidth
                  required
                >
                  {Object.keys(Genders).map((key) => (
                    <MenuItem key={key} value={key}>
                      {Genders[key][culture]}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  id="idType"
                  name="idType"
                  label="Type of identification"
                  variant="outlined"
                  value={values.idType}
                  onChange={handleChange}
                  error={showError('idType')}
                  helperText={errorText('idType')}
                  select
                  fullWidth
                  required
                >
                  {Object.keys(IDTypes).map((key) => (
                    <MenuItem key={key} value={key}>
                      {IDTypes[key][culture]}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  id="idNumber"
                  name="idNumber"
                  label="ID number"
                  variant="outlined"
                  value={values.idNumber}
                  onChange={handleChange}
                  error={showError('idNumber')}
                  helperText={errorText('idNumber')}
                  inputProps={{ maxLength: 64 }}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl
                  error={showError('photo')}
                  className={styles.photoContainer}
                >
                  <Button variant="contained" component="label" fullWidth>
                    Browse photo{' '}
                    <input
                      id="photo"
                      name="photo"
                      accept="image/png, image/jpeg"
                      type="file"
                      hidden
                      onChange={handlePhotoChange}
                    />
                  </Button>
                  <FormHelperText>{errorText('photo')}</FormHelperText>
                </FormControl>
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
                  Register
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Link to="/login">
                  <Button type="button" fullWidth>
                    Please log in, if you already have an account
                  </Button>
                </Link>
              </Grid>
            </Grid>
          </form>
        </MuiPickersUtilsProvider>
      </CardContent>
    </Card>
  );
}

export default Register;
